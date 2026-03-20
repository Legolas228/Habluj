from unittest.mock import patch
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from .models import Booking, Lead, LeadActivity, Lesson, Progress, StudentGoal, StudentMaterial, StudentMessage, UserProfile


@override_settings(SECURE_SSL_REDIRECT=False)
class LeadApiTests(APITestCase):
	def setUp(self):
		self.payload = {
			'full_name': 'Ester Lead',
			'email': 'ester@example.com',
			'preferred_language': 'sk',
			'source': 'contact_form',
			'notes': 'inquiry:general | subject:Info',
			'consent_privacy': True,
			'consent_marketing': False,
			'consent_version': 'v1',
		}

	@patch('api.views.send_new_lead_notification')
	@patch('api.views.sync_lead_to_brevo')
	def test_public_can_create_lead(self, mock_sync, mock_notify):
		mock_sync.return_value = {'status': 'synced', 'contact_id': '12345'}
		mock_notify.return_value = {'status': 'sent'}

		response = self.client.post('/api/leads/', self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Lead.objects.count(), 1)
		lead = Lead.objects.first()
		self.assertEqual(lead.full_name, self.payload['full_name'])
		self.assertEqual(lead.source, 'contact_form')

	def test_lead_requires_privacy_consent(self):
		payload = dict(self.payload)
		payload['consent_privacy'] = False

		response = self.client.post('/api/leads/', payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('consent_privacy', response.data)
		self.assertEqual(Lead.objects.count(), 0)

	def test_lead_list_requires_admin_user(self):
		response = self.client.get('/api/leads/')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

		user = User.objects.create_user(username='normal', password='pass12345')
		self.client.force_authenticate(user=user)
		response = self.client.get('/api/leads/')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

		admin = User.objects.create_superuser(username='admin', email='admin@example.com', password='pass12345')
		self.client.force_authenticate(user=admin)
		response = self.client.get('/api/leads/')
		self.assertEqual(response.status_code, status.HTTP_200_OK)

	@patch('api.views.send_new_lead_notification')
	@patch('api.views.sync_lead_to_brevo')
	def test_admin_can_update_lead_stage(self, mock_sync, mock_notify):
		mock_sync.return_value = {'status': 'synced', 'contact_id': '12345'}
		mock_notify.return_value = {'status': 'sent'}

		create_response = self.client.post('/api/leads/', self.payload, format='json')
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		lead_id = create_response.data['id']

		admin = User.objects.create_superuser(username='admin2', email='admin2@example.com', password='pass12345')
		self.client.force_authenticate(user=admin)

		patch_response = self.client.patch(f'/api/leads/{lead_id}/', {'stage': 'qualified'}, format='json')
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.assertEqual(patch_response.data['stage'], 'qualified')
		self.assertTrue(LeadActivity.objects.filter(lead_id=lead_id, action='stage_changed').exists())

	@patch('api.views.send_new_lead_notification')
	@patch('api.views.sync_lead_to_brevo')
	def test_duplicate_detection_and_csv_export(self, mock_sync, mock_notify):
		mock_sync.return_value = {'status': 'synced', 'contact_id': '12345'}
		mock_notify.return_value = {'status': 'sent'}

		first = self.client.post('/api/leads/', self.payload, format='json')
		self.assertEqual(first.status_code, status.HTTP_201_CREATED)

		payload_two = dict(self.payload)
		payload_two['full_name'] = 'Ester Lead Duplicate'
		second = self.client.post('/api/leads/', payload_two, format='json')
		self.assertEqual(second.status_code, status.HTTP_201_CREATED)
		self.assertTrue(second.data['duplicate_of'])
		self.assertEqual(second.data['duplicate_confidence'], 'email')

		admin = User.objects.create_superuser(username='admin3', email='admin3@example.com', password='pass12345')
		self.client.force_authenticate(user=admin)

		csv_response = self.client.get('/api/leads/export_csv/?duplicates=true')
		self.assertEqual(csv_response.status_code, status.HTTP_200_OK)
		self.assertIn('text/csv', csv_response['Content-Type'])
		self.assertIn('Ester Lead Duplicate', csv_response.content.decode('utf-8'))

	@patch('api.views.send_new_lead_notification')
	@patch('api.views.sync_lead_to_brevo')
	def test_admin_can_set_follow_up(self, mock_sync, mock_notify):
		mock_sync.return_value = {'status': 'synced', 'contact_id': '12345'}
		mock_notify.return_value = {'status': 'sent'}

		create_response = self.client.post('/api/leads/', self.payload, format='json')
		lead_id = create_response.data['id']

		admin = User.objects.create_superuser(username='admin4', email='admin4@example.com', password='pass12345')
		self.client.force_authenticate(user=admin)

		patch_response = self.client.patch(
			f'/api/leads/{lead_id}/',
			{'follow_up_at': '2026-03-20T12:00:00Z'},
			format='json',
		)
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.assertIsNotNone(patch_response.data['follow_up_at'])
		self.assertTrue(LeadActivity.objects.filter(lead_id=lead_id, action='follow_up_updated').exists())


@override_settings(SECURE_SSL_REDIRECT=False)
class StudentAuthApiTests(APITestCase):
	def setUp(self):
		self.password = 'Pass12345!'
		self.user = User.objects.create_user(
			username='student1',
			email='student1@example.com',
			password=self.password,
			first_name='Ana',
			last_name='Perez',
		)

	def test_student_can_login_with_username_and_access_me(self):
		login_response = self.client.post('/api/auth/login/', {
			'identifier': 'student1',
			'password': self.password,
		}, format='json')

		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		token = login_response.data.get('token')
		self.assertTrue(token)

		self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
		me_response = self.client.get('/api/auth/me/')
		self.assertEqual(me_response.status_code, status.HTTP_200_OK)
		self.assertEqual(me_response.data['username'], 'student1')

	def test_student_can_login_with_email_and_logout(self):
		login_response = self.client.post('/api/auth/login/', {
			'identifier': 'student1@example.com',
			'password': self.password,
		}, format='json')

		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		token = login_response.data.get('token')
		self.assertTrue(Token.objects.filter(key=token, user=self.user).exists())

		self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
		logout_response = self.client.post('/api/auth/logout/')
		self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Token.objects.filter(key=token).exists())

	def test_student_can_register_and_profile_is_created(self):
		register_response = self.client.post('/api/auth/register/', {
			'username': 'new_student',
			'email': 'new_student@example.com',
			'password': 'Pass12345!',
			'password_confirm': 'Pass12345!',
			'language_level': 'A2',
		}, format='json')

		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(register_response.data.get('token'))
		self.assertTrue(User.objects.filter(username='new_student').exists())
		user = User.objects.get(username='new_student')
		self.assertTrue(UserProfile.objects.filter(user=user, language_level='A2').exists())

	def test_student_can_get_and_patch_profile_endpoint(self):
		login_response = self.client.post('/api/auth/login/', {
			'identifier': 'student1',
			'password': self.password,
		}, format='json')
		token = login_response.data.get('token')
		self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

		get_response = self.client.get('/api/users/profile/')
		self.assertEqual(get_response.status_code, status.HTTP_200_OK)
		self.assertEqual(get_response.data['language_level'], 'A1')

		patch_response = self.client.patch('/api/users/profile/', {
			'language_level': 'B1',
			'bio': 'Quiero enfocarme en conversacion.',
		}, format='json')
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.assertEqual(patch_response.data['language_level'], 'B1')


@override_settings(SECURE_SSL_REDIRECT=False)
class StudentPortalDataApiTests(APITestCase):
	def setUp(self):
		self.password = 'Pass12345!'
		self.student = User.objects.create_user(
			username='student_portal',
			email='student_portal@example.com',
			password=self.password,
		)
		self.other_user = User.objects.create_user(
			username='other_student',
			email='other_student@example.com',
			password=self.password,
		)
		self.lesson = Lesson.objects.create(
			title='Conversacion B1',
			description='Practica oral',
			level='B1',
			duration=60,
			price='20.00',
		)
		self.booking = Booking.objects.create(
			student=self.student,
			lesson=self.lesson,
			date='2026-05-10',
			time='12:00:00',
			status='confirmed',
		)
		Booking.objects.create(
			student=self.other_user,
			lesson=self.lesson,
			date='2026-05-11',
			time='13:00:00',
			status='confirmed',
		)
		StudentMaterial.objects.create(
			student=self.student,
			booking=self.booking,
			title='Guia Subjuntivo',
			resource_type='pdf',
			external_url='https://example.com/subjuntivo.pdf',
		)
		StudentMaterial.objects.create(
			student=self.other_user,
			title='Material ajeno',
			resource_type='link',
			external_url='https://example.com/other',
		)
		StudentGoal.objects.create(
			student=self.student,
			title='Practicar conversación',
			description='Meta semanal de speaking.',
		)
		StudentMessage.objects.create(
			student=self.student,
			subject='Recordatorio',
			body='Revisa el material antes de la clase.',
		)

	def _auth(self):
		login_response = self.client.post('/api/auth/login/', {
			'identifier': self.student.username,
			'password': self.password,
		}, format='json')
		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		token = login_response.data.get('token')
		self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

	def test_student_only_sees_own_bookings_and_can_cancel(self):
		self._auth()
		list_response = self.client.get('/api/bookings/')
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)
		self.assertEqual(list_response.data[0]['id'], self.booking.id)

		cancel_response = self.client.post(f'/api/bookings/{self.booking.id}/cancel/')
		self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)
		self.booking.refresh_from_db()
		self.assertEqual(self.booking.status, 'cancelled')

	def test_student_only_sees_own_materials(self):
		self._auth()
		response = self.client.get('/api/materials/')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['title'], 'Guia Subjuntivo')

	def test_student_can_view_goals_and_mark_message_as_read(self):
		self._auth()
		goals_response = self.client.get('/api/goals/')
		self.assertEqual(goals_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(goals_response.data), 1)

		messages_response = self.client.get('/api/messages/')
		self.assertEqual(messages_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(messages_response.data), 1)
		message_id = messages_response.data[0]['id']

		mark_read_response = self.client.patch(
			f'/api/messages/{message_id}/',
			{'is_read': True},
			format='json',
		)
		self.assertEqual(mark_read_response.status_code, status.HTTP_200_OK)
		self.assertTrue(mark_read_response.data['is_read'])


@override_settings(SECURE_SSL_REDIRECT=False)
class AdminPortalApiTests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_superuser(
			username='ester_admin',
			email='ester_admin@example.com',
			password='Pass12345!',
		)
		self.student = User.objects.create_user(
			username='student_admin_view',
			email='student_admin_view@example.com',
			password='Pass12345!',
			first_name='Lucia',
			last_name='Martin',
		)
		self.second_admin = User.objects.create_superuser(
			username='other_admin',
			email='other_admin@example.com',
			password='Pass12345!',
		)
		UserProfile.objects.create(user=self.student, language_level='B1', bio='Needs speaking practice')

		self.lesson = Lesson.objects.create(
			title='Clase B1',
			description='Sesion intermedia',
			level='B1',
			duration=60,
			price='20.00',
		)
		self.lesson_two = Lesson.objects.create(
			title='Clase C1',
			description='Sesion avanzada',
			level='C1',
			duration=90,
			price='30.00',
		)
		self.booking = Booking.objects.create(
			student=self.student,
			lesson=self.lesson,
			date='2026-06-15',
			time='10:00:00',
			status='pending',
		)
		self.material = StudentMaterial.objects.create(
			student=self.student,
			created_by=self.admin,
			title='Material admin',
			description='Descripcion valida para material.',
			resource_type='link',
			external_url='https://example.com/material-admin',
		)

	def test_admin_students_requires_admin(self):
		response = self.client.get('/api/admin/students/')
		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

		self.client.force_authenticate(user=self.admin)
		response = self.client.get('/api/admin/students/?q=lucia')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['username'], 'student_admin_view')
		self.assertEqual(response.data[0]['language_level'], 'B1')
		self.assertEqual(response.data[0]['booking_count'], 1)

	def test_admin_can_filter_and_update_bookings(self):
		self.client.force_authenticate(user=self.admin)

		list_response = self.client.get('/api/bookings/?status=pending&q=lucia')
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)
		self.assertEqual(list_response.data[0]['id'], self.booking.id)

		patch_response = self.client.patch(
			f'/api/bookings/{self.booking.id}/',
			{
				'lesson_id': self.lesson_two.id,
				'status': 'confirmed',
				'date': '2026-06-20',
				'time': '11:30:00',
				'notes': 'Reagendada por admin.',
			},
			format='json',
		)
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.assertEqual(patch_response.data['status'], 'confirmed')
		self.assertEqual(patch_response.data['date'], '2026-06-20')
		self.assertEqual(patch_response.data['time'], '11:30:00')
		self.assertEqual(patch_response.data['notes'], 'Reagendada por admin.')
		self.assertEqual(patch_response.data['lesson']['id'], self.lesson_two.id)

	def test_admin_can_patch_student_profile_and_status(self):
		self.client.force_authenticate(user=self.admin)

		response = self.client.patch(
			f'/api/admin/students/{self.student.id}/',
			{
				'first_name': 'Lucia Updated',
				'last_name': 'Martin Updated',
				'email': 'lucia.updated@example.com',
				'is_active': False,
				'language_level': 'C1',
				'bio': 'Updated by admin.',
			},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['language_level'], 'C1')

		self.student.refresh_from_db()
		self.assertEqual(self.student.first_name, 'Lucia Updated')
		self.assertEqual(self.student.last_name, 'Martin Updated')
		self.assertEqual(self.student.email, 'lucia.updated@example.com')
		self.assertFalse(self.student.is_active)
		self.assertEqual(self.student.userprofile.bio, 'Updated by admin.')

	def test_only_material_creator_can_delete_material(self):
		self.client.force_authenticate(user=self.second_admin)
		forbidden_response = self.client.delete(f'/api/materials/{self.material.id}/')
		self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

		self.client.force_authenticate(user=self.admin)
		allowed_response = self.client.delete(f'/api/materials/{self.material.id}/')
		self.assertEqual(allowed_response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(StudentMaterial.objects.filter(id=self.material.id).exists())

	def test_admin_can_manage_goals_messages_and_progress(self):
		self.client.force_authenticate(user=self.admin)

		goal_response = self.client.post('/api/goals/', {
			'student_id': self.student.id,
			'title': 'Meta C1',
			'description': 'Preparar examen C1',
			'is_completed': False,
		}, format='json')
		self.assertEqual(goal_response.status_code, status.HTTP_201_CREATED)

		message_response = self.client.post('/api/messages/', {
			'student_id': self.student.id,
			'subject': 'Plan de semana',
			'body': 'Te dejo tareas de listening.',
		}, format='json')
		self.assertEqual(message_response.status_code, status.HTTP_201_CREATED)

		progress_response = self.client.post('/api/progress/', {
			'student_id': self.student.id,
			'lesson_id': self.lesson.id,
			'completed': True,
			'score': 92,
			'notes': 'Buen desempeño oral.',
		}, format='json')
		self.assertEqual(progress_response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(progress_response.data['completed'])

		self.assertEqual(StudentGoal.objects.filter(student=self.student).count(), 1)
		self.assertEqual(StudentMessage.objects.filter(student=self.student).count(), 1)
		self.assertEqual(Progress.objects.filter(student=self.student).count(), 1)
