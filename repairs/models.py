from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=30)
    address = models.TextField(blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'
        ordering = ['-id']

    def __str__(self):
        return f"{self.name} ({self.phone})"


class RepairOrder(models.Model):
    SERVICE_TYPE_CHOICES = [
        ('home', 'At-Home Service (🏠)'),
        ('shop', 'In-Shop Repair (🏬)'),
    ]

    STATUS_CHOICES = [
        ('Booked', 'Booked'),
        ('Dispatch', 'Dispatch'),
        ('Diagnosing', 'Diagnosing'),
        ('Repairing', 'Repairing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    tracking_code = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='repair_orders',
        db_column='customer_id'
    )
    device_category = models.CharField(max_length=100)
    device_name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPE_CHOICES, default='home')
    issue_description = models.TextField(blank=True, null=True)
    price_estimate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Booked')
    assigned_tech = models.CharField(max_length=100, default='Unassigned', blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'repair_orders'
        verbose_name = 'Repair Order'
        verbose_name_plural = 'Repair Orders'
        ordering = ['-id']

    def __str__(self):
        return f"[{self.tracking_code}] {self.device_name} ({self.status})"


class ContactInquiry(models.Model):
    STATUS_CHOICES = [
        ('New', 'New'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='New')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_inquiries'
        verbose_name = 'Contact Inquiry'
        verbose_name_plural = 'Contact Inquiries'
        ordering = ['-id']

    def __str__(self):
        return f"Inquiry from {self.name} - [{self.status}]"
