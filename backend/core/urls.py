"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    UserProfileViewSet,
    LessonViewSet,
    BookingViewSet,
    ProgressViewSet,
    StudentMaterialViewSet,
    StudentGoalViewSet,
    StudentMessageViewSet,
    LeadViewSet,
    StudentLoginView,
    StudentLogoutView,
    StudentMeView,
    StudentRegisterView,
    StudentProfileView,
    AdminStudentListView,
    AdminStudentDetailView,
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'progress', ProgressViewSet)
router.register(r'goals', StudentGoalViewSet, basename='goals')
router.register(r'messages', StudentMessageViewSet, basename='messages')
router.register(r'materials', StudentMaterialViewSet, basename='materials')
router.register(r'leads', LeadViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', StudentLoginView.as_view(), name='student-login'),
    path('api/auth/register/', StudentRegisterView.as_view(), name='student-register'),
    path('api/auth/logout/', StudentLogoutView.as_view(), name='student-logout'),
    path('api/auth/me/', StudentMeView.as_view(), name='student-me'),
    path('api/users/profile/', StudentProfileView.as_view(), name='student-profile'),
    path('api/admin/students/', AdminStudentListView.as_view(), name='admin-students'),
    path('api/admin/students/<int:user_id>/', AdminStudentDetailView.as_view(), name='admin-student-detail'),
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
