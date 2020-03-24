"""quantified_flu URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
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
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import logout_user, HomeView, about, delete_account, ManageAccountView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("logout/", logout_user, name="logout"),
    path("manage_account/", ManageAccountView.as_view(), name="manage-account"),
    path("", HomeView.as_view(), name="home"),
    path("about/", about, name="about"),
    path("retrospective/", include("retrospective.urls")),
    path("import_data/", include("import_data.urls")),
    path("checkin/", include("checkin.urls")),
    path("report/", include("reports.urls")),
    path("delete-account/", delete_account, name="delete-account"),
]

# Needed for static and media files in local development.
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# openhumans URLs
urlpatterns += [path("openhumans/", include("openhumans.urls"))]
