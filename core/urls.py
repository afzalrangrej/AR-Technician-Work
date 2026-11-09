from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from repairs import views

# Customize Django Admin Panel Titles, Branding & Site URL
admin.site.site_header = "⚡ ElectroHome Repair Shop Admin"
admin.site.site_title = "ElectroHome Admin Management"
admin.site.index_title = "Backend Operations & Management Portal"
admin.site.site_url = "/"  # "View site" button opens public website

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('repairs.urls')),
    path('', views.serve_index, name='home'),
    path('index.html', views.serve_index, name='index'),
    path('admin.html', views.serve_admin_html, name='admin_portal'),
    re_path(r'^(?P<path>(styles\.css|script\.js|images/.*))$', serve, {'document_root': settings.BASE_DIR}),
]
