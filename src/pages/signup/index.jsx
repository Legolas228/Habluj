import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  const tr = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    birth_date: '',
    learning_reason: '',
    password: '',
    password_confirm: '',
    language_level: 'A1',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = tr('signup.errors.firstNameRequired', 'El nombre es obligatorio');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = tr('signup.errors.lastNameRequired', 'El apellido es obligatorio');
    }

    if (!formData.birth_date) {
      newErrors.birth_date = tr('signup.errors.birthDateRequired', 'La fecha de nacimiento es obligatoria');
    }

    if (!formData.learning_reason.trim()) {
      newErrors.learning_reason = tr('signup.errors.reasonRequired', 'Indica por que quieres aprender espanol');
    }

    if (!formData.username.trim()) {
      newErrors.username = tr('signup.errors.usernameRequired', 'El usuario es obligatorio');
    } else if (formData.username.length < 3) {
      newErrors.username = tr('signup.errors.usernameMin', 'El usuario debe tener al menos 3 caracteres');
    }

    if (!formData.email.trim()) {
      newErrors.email = tr('signup.errors.emailRequired', 'El correo es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tr('signup.errors.emailInvalid', 'Formato de correo invalido');
    }

    if (!formData.password) {
      newErrors.password = tr('signup.errors.passwordRequired', 'La contrasena es obligatoria');
    } else if (formData.password.length < 8) {
      newErrors.password = tr('signup.errors.passwordMin', 'La contrasena debe tener al menos 8 caracteres');
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = tr('signup.errors.passwordMismatch', 'Las contrasenas no coinciden');
    }

    return newErrors;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        birth_date: formData.birth_date,
        learning_reason: formData.learning_reason.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        language_level: formData.language_level,
      });
      navigate('/student-dashboard', { replace: true });
    } catch (submitError) {
      setErrors({
        submit: submitError?.message || tr('signup.errors.submitFailed', 'No se pudo crear la cuenta.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-soft p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-3">
              <Icon name="User" size={22} />
            </div>
            <h1 className="text-2xl font-headlines font-bold text-foreground">{tr('signup.title', 'Crea tu cuenta')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tr('signup.subtitle', 'Unete y empieza a aprender espanol')}</p>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 rounded-md border border-error/20 bg-error/10 text-error text-sm" role="alert">
              {errors.submit}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label={tr('signup.firstNameLabel', 'Nombre')}
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder={tr('signup.firstNamePlaceholder', 'Tu nombre')}
              autoComplete="given-name"
              required
              error={errors.first_name}
            />

            <Input
              label={tr('signup.lastNameLabel', 'Apellido')}
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder={tr('signup.lastNamePlaceholder', 'Tu apellido')}
              autoComplete="family-name"
              required
              error={errors.last_name}
            />

            <Input
              label={tr('signup.emailLabel', 'Correo electronico')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={tr('signup.emailPlaceholder', 'tu@correo.com')}
              autoComplete="email"
              required
              error={errors.email}
            />

            <Input
              label={tr('signup.usernameLabel', 'Usuario')}
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={tr('signup.usernamePlaceholder', 'tu_usuario')}
              autoComplete="username"
              required
              error={errors.username}
            />

            <Input
              label={tr('signup.birthDateLabel', 'Fecha de nacimiento')}
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              required
              error={errors.birth_date}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {tr('signup.levelLabel', 'Nivel de espanol')}
              </label>
              <select
                name="language_level"
                value={formData.language_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="A1">A1 - Principiante</option>
                <option value="A2">A2 - Basico</option>
                <option value="B1">B1 - Intermedio</option>
                <option value="B2">B2 - Intermedio alto</option>
                <option value="C1">C1 - Avanzado</option>
                <option value="C2">C2 - Dominio</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tr('signup.reasonLabel', 'Por que quieres aprender espanol?')}</label>
              <textarea
                name="learning_reason"
                value={formData.learning_reason}
                onChange={handleChange}
                placeholder={tr('signup.reasonPlaceholder', 'Cuentanos tu motivacion y objetivos...')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                required
              />
              {errors.learning_reason && <p className="text-sm text-error">{errors.learning_reason}</p>}
            </div>

            <Input
              label={tr('signup.passwordLabel', 'Contrasena')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={tr('signup.passwordPlaceholder', 'Minimo 8 caracteres')}
              autoComplete="new-password"
              required
              error={errors.password}
            />

            <Input
              label={tr('signup.confirmPasswordLabel', 'Confirmar contrasena')}
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder={tr('signup.confirmPasswordPlaceholder', 'Repite la contrasena')}
              autoComplete="new-password"
              required
              error={errors.password_confirm}
            />

            <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? tr('signup.creating', 'Creando cuenta...') : tr('signup.submit', 'Crear cuenta')}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground text-center">
            <p>
              {tr('signup.loginPrompt', 'Ya tienes cuenta?')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {tr('signup.loginLink', 'Inicia sesion')}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SignupPage;
