import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface OrderSummaryItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type DeliveryMethod = 'econt-office' | 'personal-address';

interface CustomerDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
}

interface OrderSummary {
  items: OrderSummaryItem[];
  subtotal: number;
  discountCode?: string | null;
  discountValue: number;
  total: number;
  customer?: CustomerDetails;
}

@Component({
  selector: 'app-thank-you-page',
  standalone: false,
  templateUrl: './thank-you-page.component.html',
  styleUrl: './thank-you-page.component.css'
})
export class ThankYouPageComponent implements OnInit {
  order?: OrderSummary;
  private readonly deliveryLabels: Record<DeliveryMethod, string> = {
    'econt-office': 'Офис на Еконт',
    'personal-address': 'Личен адрес'
  };

  private readonly addressLabels: Record<DeliveryMethod, string> = {
    'econt-office': 'Офис',
    'personal-address': 'Адрес'
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrder();
  }

  get hasOrder(): boolean {
    return !!this.order && this.order.items.length > 0;
  }

  get customerFullName(): string {
    const customer = this.order?.customer;
    if (!customer) {
      return '';
    }
    return `${customer.firstName} ${customer.lastName}`.trim();
  }

  formatCurrency(value: number): string {
    return `${value.toFixed(2)} лв`;
  }

  deliveryMethodLabel(method?: DeliveryMethod): string {
    if (!method) {
      return '';
    }
    return this.deliveryLabels[method] ?? method;
  }

  deliveryAddressLabel(method?: DeliveryMethod): string {
    if (!method) {
      return 'Адрес';
    }
    return this.addressLabels[method] ?? 'Адрес';
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  private loadOrder(): void {
    const navigation = this.router.getCurrentNavigation();
    const stateOrder = navigation?.extras?.state?.['order'] as OrderSummary | undefined;

    if (stateOrder) {
      this.order = stateOrder;
      this.persistOrder(stateOrder);
      return;
    }

    const stored = localStorage.getItem('bestlashes-last-order');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as OrderSummary;
        this.order = {
          ...parsed,
          items: parsed.items ?? []
        };
      } catch (error) {
        console.warn('Неуспешно зареждане на последната поръчка.', error);
        localStorage.removeItem('bestlashes-last-order');
      }
    }
  }

  private persistOrder(order: OrderSummary): void {
    try {
      localStorage.setItem('bestlashes-last-order', JSON.stringify(order));
    } catch (error) {
      console.warn('Неуспешно запазване на поръчката.', error);
    }
  }
}
