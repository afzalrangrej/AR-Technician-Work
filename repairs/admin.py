from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.db.models import Sum
from .models import Customer, RepairOrder, ContactInquiry


class RepairOrderInline(admin.TabularInline):
    model = RepairOrder
    extra = 0
    fields = ('tracking_code', 'device_category', 'device_name', 'service_type', 'price_estimate', 'status', 'assigned_tech')
    readonly_fields = ('tracking_code',)
    show_change_link = True


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'zip_code', 'orders_count', 'total_spent', 'created_at')
    list_display_links = ('id', 'name')
    search_fields = ('name', 'phone', 'email', 'zip_code', 'address')
    list_filter = ('created_at',)
    inlines = [RepairOrderInline]
    ordering = ('-id',)

    def orders_count(self, obj):
        count = obj.repair_orders.count()
        return format_html(
            '<span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 10px; font-weight: bold;">{} Orders</span>',
            count
        )
    orders_count.short_description = 'Total Orders'

    def total_spent(self, obj):
        total = obj.repair_orders.filter(status='Completed').aggregate(Sum('price_estimate'))['price_estimate__sum'] or 0.00
        return f"${total:,.2f}"
    total_spent.short_description = 'Spent (Completed)'


@admin.register(RepairOrder)
class RepairOrderAdmin(admin.ModelAdmin):
    list_display = (
        'tracking_code',
        'customer_link',
        'device_category',
        'device_name',
        'service_type_badge',
        'formatted_price',
        'status',
        'assigned_tech',
        'created_at'
    )
    list_display_links = ('tracking_code',)
    list_filter = ('status', 'service_type', 'device_category', 'created_at')
    search_fields = ('tracking_code', 'device_name', 'customer__name', 'customer__phone', 'assigned_tech', 'issue_description')
    list_editable = ('status', 'assigned_tech')
    ordering = ('-id',)

    fieldsets = (
        ('Order Identification & Status', {
            'fields': ('tracking_code', 'status', 'service_type')
        }),
        ('Customer Info', {
            'fields': ('customer',)
        }),
        ('Device & Issue Specifications', {
            'fields': ('device_category', 'device_name', 'issue_description')
        }),
        ('Technician & Billing', {
            'fields': ('price_estimate', 'assigned_tech', 'notes')
        }),
    )

    def customer_link(self, obj):
        if obj.customer:
            url = reverse('admin:repairs_customer_change', args=[obj.customer.id])
            return format_html('<a href="{}" style="font-weight: 600; color: #2563eb; text-decoration: none;">👤 {}</a>', url, obj.customer.name)
        return '-'
    customer_link.short_description = 'Customer'

    def service_type_badge(self, obj):
        if obj.service_type == 'home':
            return mark_safe('<span style="background-color: #0284c7; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🏠 At-Home</span>')
        return mark_safe('<span style="background-color: #6366f1; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🏬 In-Shop</span>')
    service_type_badge.short_description = 'Service Type'

    def formatted_price(self, obj):
        return f"${obj.price_estimate:,.2f}" if obj.price_estimate is not None else "$0.00"
    formatted_price.short_description = 'Price Est.'
    formatted_price.admin_order_field = 'price_estimate'

    # Admin Bulk Actions
    actions = [
        'mark_as_booked',
        'mark_as_dispatch',
        'mark_as_diagnosing',
        'mark_as_repairing',
        'mark_as_completed',
        'mark_as_cancelled'
    ]

    @admin.action(description='Mark selected orders as Booked')
    def mark_as_booked(self, request, queryset):
        count = queryset.update(status='Booked')
        self.message_user(request, f"{count} repair order(s) updated to Booked.")

    @admin.action(description='Mark selected orders as Dispatch')
    def mark_as_dispatch(self, request, queryset):
        count = queryset.update(status='Dispatch')
        self.message_user(request, f"{count} repair order(s) updated to Dispatch.")

    @admin.action(description='Mark selected orders as Diagnosing')
    def mark_as_diagnosing(self, request, queryset):
        count = queryset.update(status='Diagnosing')
        self.message_user(request, f"{count} repair order(s) updated to Diagnosing.")

    @admin.action(description='Mark selected orders as Repairing')
    def mark_as_repairing(self, request, queryset):
        count = queryset.update(status='Repairing')
        self.message_user(request, f"{count} repair order(s) updated to Repairing.")

    @admin.action(description='Mark selected orders as Completed')
    def mark_as_completed(self, request, queryset):
        count = queryset.update(status='Completed')
        self.message_user(request, f"{count} repair order(s) updated to Completed.")

    @admin.action(description='Mark selected orders as Cancelled')
    def mark_as_cancelled(self, request, queryset):
        count = queryset.update(status='Cancelled')
        self.message_user(request, f"{count} repair order(s) updated to Cancelled.")


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'short_message', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'phone', 'message')
    list_editable = ('status',)
    ordering = ('-id',)

    def short_message(self, obj):
        if len(obj.message) > 60:
            return obj.message[:57] + '...'
        return obj.message
    short_message.short_description = 'Message Preview'
