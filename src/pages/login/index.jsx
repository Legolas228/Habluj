import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SiteFooter from '../../components/ui/SiteFooter';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/student-dashboard';

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError?.message || 'No se pudo iniciar sesion.');
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
            <h1 className="text-2xl font-headlines font-bold text-foreground">Portal de alumnos</h1>
            <p className="text-sm text-muted-foreground mt-1">Accede a tus sesiones y materiales</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md border border-error/20 bg-error/10 text-error text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Usuario o email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="tu_usuario o correo"
              autoComplete="username"
              required
            />

            <Input
              label="Contrasena"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />

            <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Iniciar sesion'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-sm text-muted-foreground text-center">
            <p>
              ¿No puedes acceder?{' '}
              <Link to="/contact" className="text-primary hover:underline">
                Contacta con Ester
              </Link>
            </p>
            <p className="mt-3">
              ¿Primera vez?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LoginPage;
