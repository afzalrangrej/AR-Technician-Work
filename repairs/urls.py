from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='api_health'),
    path('stats/', views.get_stats, name='api_stats'),
    path('bookings/', views.handle_bookings, name='api_bookings'),
    path('orders/<str:code>/', views.get_order_by_code, name='api_order_by_code'),
    path('contact/', views.handle_contact, name='api_contact'),
]
