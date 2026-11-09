import json
import random
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count
from .models import Customer, RepairOrder, ContactInquiry


def serve_index(request):
    file_path = settings.BASE_DIR / 'index.html'
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    raise Http404("index.html not found")


def serve_admin_html(request):
    file_path = settings.BASE_DIR / 'admin.html'
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    raise Http404("admin.html not found")


def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'database': 'sqlite3 (Django Backend)',
        'admin_url': '/admin/'
    })


def get_stats(request):
    total_customers = Customer.objects.count()
    total_orders = RepairOrder.objects.count()
    active_orders = RepairOrder.objects.exclude(status__in=['Completed', 'Cancelled']).count()
    completed_orders = RepairOrder.objects.filter(status='Completed')
    total_revenue = completed_orders.aggregate(Sum('price_estimate'))['price_estimate__sum'] or 0.00

    return JsonResponse({
        'success': True,
        'stats': {
            'totalCustomers': total_customers,
            'totalOrders': total_orders,
            'activeOrders': active_orders,
            'completedRevenue': f"{total_revenue:.2f}"
        }
    })


@csrf_exempt
def handle_bookings(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = request.POST

        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip() or None
        address = data.get('address', '').strip() or None
        zip_code = data.get('zipCode', '').strip() or None
        device_category = data.get('deviceCategory', 'General Electronics').strip()
        device_name = data.get('deviceName', 'Electronic Device').strip()
        service_type = data.get('serviceType', 'home').strip().lower()
        issue_description = data.get('issueDescription', 'Repair inspection requested').strip()
        price_estimate = data.get('priceEstimate', 85.00 if service_type == 'home' else 65.00)

        if not name or not phone:
            return JsonResponse({'error': 'Customer Name and Phone number are required.'}, status=400)

        # Get or create customer
        customer, created = Customer.objects.get_or_create(
            phone=phone,
            defaults={
                'name': name,
                'email': email,
                'address': address,
                'zip_code': zip_code
            }
        )
        if not created:
            customer.name = name
            if email: customer.email = email
            if address: customer.address = address
            if zip_code: customer.zip_code = zip_code
            customer.save()

        # Generate unique tracking code
        prefix = 'SHOP' if service_type == 'shop' else 'HOME'
        tracking_code = f"{prefix}-{random.randint(1000, 9999)}"

        order = RepairOrder.objects.create(
            tracking_code=tracking_code,
            customer=customer,
            device_category=device_category,
            device_name=device_name,
            service_type=service_type,
            issue_description=issue_description,
            price_estimate=float(price_estimate),
            status='Booked',
            assigned_tech='Unassigned',
            notes='New customer booking logged via Django backend.'
        )

        return JsonResponse({
            'success': True,
            'message': 'Booking saved successfully in Django database!',
            'trackingCode': tracking_code,
            'orderId': order.id,
            'customerId': customer.id
        }, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_order_by_code(request, code):
    try:
        order = RepairOrder.objects.select_related('customer').get(tracking_code__iexact=code.strip())
        
        step = 1
        if order.status in ['Dispatch', 'In-Shop']: step = 2
        elif order.status in ['Diagnosing', 'Repairing']: step = 3
        elif order.status == 'Completed': step = 4

        return JsonResponse({
            'success': True,
            'order': {
                'id': order.id,
                'tracking_code': order.tracking_code,
                'device_category': order.device_category,
                'device_name': order.device_name,
                'service_type': order.service_type,
                'issue_description': order.issue_description,
                'price_estimate': float(order.price_estimate),
                'status': order.status,
                'assigned_tech': order.assigned_tech,
                'notes': order.notes,
                'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'customer_name': order.customer.name,
                'customer_phone': order.customer.phone,
                'zip_code': order.customer.zip_code,
                'step': step
            }
        })
    except RepairOrder.DoesNotExist:
        return JsonResponse({'error': f"Order '{code}' not found."}, status=404)


@csrf_exempt
def handle_contact(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = request.POST

        name = data.get('name', '').strip()
        email = data.get('email', '').strip() or None
        phone = data.get('phone', '').strip() or None
        message = data.get('message', '').strip()

        if not name or not message:
            return JsonResponse({'error': 'Name and message are required.'}, status=400)

        ContactInquiry.objects.create(
            name=name,
            email=email,
            phone=phone,
            message=message,
            status='New'
        )
        return JsonResponse({'success': True, 'message': 'Inquiry saved successfully!'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)
