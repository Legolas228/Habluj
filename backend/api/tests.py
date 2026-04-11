from unittest.mock import patch
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from .models import Availability, Booking, CreditLedger, Lead, LeadActivity, Lesson, Progress, StudentGoal, StudentMaterial, StudentMessage, UserProfile
from .models import WeeklyAvailabilitySlot, BookingSlotBlock


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
	@patch('api.views.sync_lead_to_mailerlite')
	def test_public_can_create_lead(self, mock_sync, mock_notify):
		mock_sync.return_value = {'status': 'synced', 'contact_id': '12345'}
		mock_notify.return_value = {'status': 'sent'}

		response = self.client.post('/api/leads/', self.payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Lead.objects.count(), 1)
		lead = Lead.objects.first()
		self.assertEqual(lead.full_name, self.payload['full_name'])
		self.assertEqual(lead.source, 'contact_form')

	@patch('api.views.send_level_test_results_email')
	def test_advanced_test_lead_sends_result_email(self, mock_send_result_email):
		mock_send_result_email.return_value = {'status': 'sent'}
		payload = dict(self.payload)
		payload['source'] = 'advanced_level_test'
		payload['notes'] = 'test_type:advanced_spanish_b2_ceiling | test_score:11/15 | test_band:B2 solido | q1:c'

		response = self.client.post('/api/leads/', payload, format='json')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(Lead.objects.count(), 1)
		mock_send_result_email.assert_called_once()

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
	@patch('api.views.sync_lead_to_mailerlite')
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
	@patch('api.views.sync_lead_to_mailerlite')
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
	@patch('api.views.sync_lead_to_mailerlite')
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
			'learning_reason': 'Mejorar mi espanol para trabajo.',
			'birth_date': '1995-06-01',
		}, format='json')

		self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(register_response.data.get('token'))
		self.assertTrue(User.objects.filter(username='new_student').exists())
		user = User.objects.get(username='new_student')
		self.assertTrue(UserProfile.objects.filter(user=user, language_level='A2').exists())

	def test_login_with_duplicate_email_entries_does_not_fail(self):
		User.objects.create_user(
			username='student_duplicate_email',
			email='student1@example.com',
			password='AnotherPass123!',
			first_name='Dup',
			last_name='User',
		)

		login_response = self.client.post('/api/auth/login/', {
			'identifier': 'student1@example.com',
			'password': self.password,
		}, format='json')

		self.assertEqual(login_response.status_code, status.HTTP_200_OK)
		self.assertTrue(login_response.data.get('token'))
		self.assertEqual(login_response.data['user']['username'], 'student1')

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
		token, _ = Token.objects.get_or_create(user=self.student)
		self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

	def test_student_only_sees_own_bookings_and_can_cancel(self):
		self._auth()
		list_response = self.client.get('/api/bookings/')
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)
		self.assertEqual(list_response.data[0]['id'], self.booking.id)
		self.assertNotIn('admin_private_notes', list_response.data[0])
		self.assertNotIn('has_admin_private_notes', list_response.data[0])

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

	def test_student_can_send_message(self):
		self._auth()

		response = self.client.post('/api/messages/', {
			'body': 'Hola Ester, tengo una duda sobre la tarea de hoy.',
		}, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['student']['id'], self.student.id)
		self.assertEqual(response.data['sender']['id'], self.student.id)
		self.assertEqual(response.data['subject'], 'Chat')

	def test_student_booking_availability_respects_blocks_and_existing_bookings(self):
		from datetime import timedelta
		from django.utils import timezone

		self._auth()
		WeeklyAvailabilitySlot.objects.all().delete()
		BookingSlotBlock.objects.all().delete()

		target_date = timezone.localdate() + timedelta(days=1)
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='09:00:00', is_active=True)
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='10:00:00', is_active=True)

		Booking.objects.create(
			student=self.other_user,
			lesson=self.lesson,
			date=target_date,
			time='10:00:00',
			status='confirmed',
		)
		BookingSlotBlock.objects.create(date=target_date, time='09:00:00', is_active=True)

		response = self.client.get('/api/bookings/availability/?days=2')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		days = response.data.get('days', [])
		matching_day = next((day for day in days if day['date'] == target_date.isoformat()), None)
		self.assertIsNone(matching_day)

	@override_settings(BOOKING_LEAD_TIME_HOURS=0, BOOKING_DEFAULT_BUFFER_MINUTES=0, BOOKING_CLASS_MINUTES=60)
	def test_student_availability_reflects_weekly_ranges_and_punctual_blocks(self):
		from datetime import timedelta
		from django.utils import timezone

		self._auth()
		WeeklyAvailabilitySlot.objects.all().delete()
		Availability.objects.all().delete()
		BookingSlotBlock.objects.all().delete()

		target_date = timezone.localdate() + timedelta(days=2)
		Availability.objects.create(
			weekday=target_date.weekday(),
			start_time='09:00:00',
			end_time='11:00:00',
			buffer_minutes=0,
			is_active=True,
		)
		BookingSlotBlock.objects.create(
			date=target_date,
			time='10:00:00',
			reason='No disponible puntual',
			is_active=True,
		)

		response = self.client.get('/api/bookings/availability/?days=3&tz=Europe/Madrid')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		days = response.data.get('days', [])
		matching_day = next((day for day in days if day['date'] == target_date.isoformat()), None)
		self.assertIsNotNone(matching_day)
		slot_times = [slot['time'] for slot in matching_day['slots']]
		self.assertIn('09:00:00', slot_times)
		self.assertNotIn('10:00:00', slot_times)

	@override_settings(BOOKING_LEAD_TIME_HOURS=0, BOOKING_DEFAULT_BUFFER_MINUTES=0, BOOKING_CLASS_MINUTES=60)
	def test_admin_created_booking_is_visible_and_blocks_student_slot(self):
		from datetime import timedelta
		from django.utils import timezone

		self._auth()
		WeeklyAvailabilitySlot.objects.all().delete()
		Availability.objects.all().delete()
		BookingSlotBlock.objects.all().delete()

		target_date = timezone.localdate() + timedelta(days=2)
		Availability.objects.create(
			weekday=target_date.weekday(),
			start_time='09:00:00',
			end_time='12:00:00',
			buffer_minutes=0,
			is_active=True,
		)

		admin_booking = Booking.objects.create(
			student=self.student,
			lesson=self.lesson,
			date=target_date,
			time='10:00:00',
			status='confirmed',
		)

		list_response = self.client.get('/api/bookings/')
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertTrue(any(item['id'] == admin_booking.id for item in list_response.data))

		response = self.client.get('/api/bookings/availability/?days=3&tz=Europe/Madrid')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		days = response.data.get('days', [])
		matching_day = next((day for day in days if day['date'] == target_date.isoformat()), None)
		self.assertIsNotNone(matching_day)
		slot_times = [slot['time'] for slot in matching_day['slots']]
		self.assertIn('09:00:00', slot_times)
		self.assertNotIn('10:00:00', slot_times)
		self.assertIn('11:00:00', slot_times)

	@override_settings(BOOKING_LEAD_TIME_HOURS=0, BOOKING_DEFAULT_BUFFER_MINUTES=0, BOOKING_CLASS_MINUTES=60)
	def test_student_can_create_booking_without_credits_and_payment_starts_pending(self):
		from datetime import timedelta
		from django.utils import timezone

		self._auth()
		WeeklyAvailabilitySlot.objects.all().delete()
		target_date = timezone.localdate() + timedelta(days=1)
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='09:00:00', is_active=True)

		response = self.client.post('/api/bookings/', {
			'lesson_id': self.lesson.id,
			'date': target_date.isoformat(),
			'time': '09:00:00',
			'student_timezone': 'Europe/Madrid',
		}, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], 'pending')
		booking = Booking.objects.get(id=response.data['id'])
		self.assertEqual(booking.status, 'pending')
		self.assertTrue(hasattr(booking, 'payment'))
		self.assertEqual(booking.payment.status, 'pending_user')

	@override_settings(BOOKING_LEAD_TIME_HOURS=0, BOOKING_DEFAULT_BUFFER_MINUTES=0, BOOKING_CLASS_MINUTES=60)
	def test_student_can_pay_pending_booking_with_tokens_or_bank_transfer(self):
		from datetime import timedelta
		from django.utils import timezone

		self._auth()
		WeeklyAvailabilitySlot.objects.all().delete()
		target_date = timezone.localdate() + timedelta(days=1)
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='10:00:00', is_active=True)

		create_response = self.client.post('/api/bookings/', {
			'lesson_id': self.lesson.id,
			'date': target_date.isoformat(),
			'time': '10:00:00',
			'student_timezone': 'Europe/Madrid',
		}, format='json')
		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		booking_id = create_response.data['id']

		no_credit_response = self.client.post(f'/api/bookings/{booking_id}/pay_with_tokens/')
		self.assertEqual(no_credit_response.status_code, status.HTTP_400_BAD_REQUEST)

		CreditLedger.objects.create(
			student=self.student,
			booking_id=booking_id,
			delta=1,
			reason='top_up',
			description='Test top up',
		)

		token_payment_response = self.client.post(f'/api/bookings/{booking_id}/pay_with_tokens/')
		self.assertEqual(token_payment_response.status_code, status.HTTP_200_OK)
		booking = Booking.objects.get(id=booking_id)
		self.assertEqual(booking.status, 'confirmed')
		self.assertEqual(booking.payment.status, 'completed')

		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='11:00:00', is_active=True)
		create_response_2 = self.client.post('/api/bookings/', {
			'lesson_id': self.lesson.id,
			'date': target_date.isoformat(),
			'time': '11:00:00',
			'student_timezone': 'Europe/Madrid',
		}, format='json')
		self.assertEqual(create_response_2.status_code, status.HTTP_201_CREATED)
		booking_id_2 = create_response_2.data['id']

		transfer_response = self.client.post(f'/api/bookings/{booking_id_2}/pay_bank_transfer/')
		self.assertEqual(transfer_response.status_code, status.HTTP_200_OK)
		booking_2 = Booking.objects.get(id=booking_id_2)
		self.assertEqual(booking_2.status, 'pending')
		self.assertEqual(booking_2.payment.status, 'processing')


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
		CreditLedger.objects.create(
			student=self.student,
			delta=3,
			reason='admin_adjustment',
			description='Initial credits for admin booking tests',
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
		from datetime import date

		self.client.force_authenticate(user=self.admin)
		target_date = date.fromisoformat('2026-06-20')
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='11:30:00', is_active=True)

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
				'admin_private_notes': 'Recordar repasar subjuntivo en esta clase.',
			},
			format='json',
		)
		self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
		self.assertEqual(patch_response.data['status'], 'confirmed')
		self.assertEqual(patch_response.data['date'], '2026-06-20')
		self.assertEqual(patch_response.data['time'], '11:30:00')
		self.assertEqual(patch_response.data['notes'], 'Reagendada por admin.')
		self.assertEqual(patch_response.data['admin_private_notes'], 'Recordar repasar subjuntivo en esta clase.')
		self.assertTrue(patch_response.data['has_admin_private_notes'])
		self.assertEqual(patch_response.data['lesson']['id'], self.lesson_two.id)

	@patch('api.serializers.create_google_meet_event')
	def test_admin_can_create_manual_booking_for_student(self, mock_create_google_meet_event):
		from datetime import date, datetime

		mock_create_google_meet_event.return_value = ('https://meet.google.com/test-link', 'evt-123')
		self.client.force_authenticate(user=self.admin)
		target_date = date.fromisoformat('2026-06-25')
		WeeklyAvailabilitySlot.objects.create(weekday=target_date.weekday(), time='09:00:00', is_active=True)

		create_response = self.client.post('/api/bookings/', {
			'student_id': self.student.id,
			'lesson_id': self.lesson.id,
			'date': '2026-06-25',
			'time': '09:00:00',
			'duration_minutes': 45,
			'status': 'confirmed',
			'notes': 'Reserva manual desde agenda admin.',
		}, format='json')

		self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(create_response.data['student']['id'], self.student.id)
		self.assertEqual(create_response.data['status'], 'confirmed')
		self.assertEqual(create_response.data['effective_duration_minutes'], 45)
		start_utc = datetime.fromisoformat(create_response.data['start_time_utc'].replace('Z', '+00:00'))
		end_utc = datetime.fromisoformat(create_response.data['end_time_utc'].replace('Z', '+00:00'))
		self.assertEqual(int((end_utc - start_utc).total_seconds() // 60), 45)

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

	def test_admin_can_manage_weekly_availability_and_slot_blocks(self):
		self.client.force_authenticate(user=self.admin)

		create_slot_response = self.client.post('/api/availability/weekly-slots/', {
			'weekday': 1,
			'time': '15:00:00',
			'is_active': True,
		}, format='json')
		self.assertEqual(create_slot_response.status_code, status.HTTP_201_CREATED)
		slot_id = create_slot_response.data['id']

		create_block_response = self.client.post('/api/availability/slot-blocks/', {
			'date': '2026-06-21',
			'time': '15:00:00',
			'reason': 'Evento personal',
			'is_active': True,
		}, format='json')
		self.assertEqual(create_block_response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(create_block_response.data['reason'], 'Evento personal')
		block_id = create_block_response.data['id']

		list_slots_response = self.client.get('/api/availability/weekly-slots/?active=true')
		self.assertEqual(list_slots_response.status_code, status.HTTP_200_OK)
		self.assertTrue(any(item['id'] == slot_id for item in list_slots_response.data))

		list_blocks_response = self.client.get('/api/availability/slot-blocks/?active=true')
		self.assertEqual(list_blocks_response.status_code, status.HTTP_200_OK)
		self.assertTrue(any(item['id'] == block_id for item in list_blocks_response.data))

	@patch('api.views.list_calendar_events')
	def test_admin_can_read_google_calendar_events_feed(self, mock_list_calendar_events):
		from datetime import datetime, timezone as dt_timezone

		self.client.force_authenticate(user=self.admin)
		mock_list_calendar_events.return_value = [
			{
				'id': 'evt-1',
				'summary': 'Google Event',
				'description': '',
				'start_time_utc': datetime(2026, 6, 26, 8, 0, tzinfo=dt_timezone.utc),
				'end_time_utc': datetime(2026, 6, 26, 9, 0, tzinfo=dt_timezone.utc),
				'html_link': 'https://calendar.google.com/event?eid=evt-1',
				'is_habluj_block': False,
				'habluj_block_id': '',
			},
		]

		response = self.client.get('/api/admin/google-calendar/events/?start_date=2026-06-20&end_date=2026-06-30')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['id'], 'evt-1')
