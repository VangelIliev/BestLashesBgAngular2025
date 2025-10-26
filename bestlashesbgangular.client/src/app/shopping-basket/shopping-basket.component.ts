import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface BasketItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  image: string;
  tag?: string;
}

interface DiscountDefinition {
  code: string;
  label?: string;
  percent?: number;
  amount?: number;
}

interface OrderPayload {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountCode?: string | null;
  discountValue: number;
  shipping: number;
  total: number;
}

@Component({
  selector: 'app-shopping-basket',
  standalone: false,
  templateUrl: './shopping-basket.component.html',
  styleUrl: './shopping-basket.component.css'
})
export class ShoppingBasketComponent implements OnInit, OnDestroy {
  readonly freeShippingThreshold = 99;
  readonly defaultShippingFee = 6.9;

  readonly discounts: DiscountDefinition[] = [
    { code: 'LASHES10', label: '-10% за нови клиенти', percent: 10 },
    { code: 'BESTGIRL5', label: '-5 лв благодарствен ваучер', amount: 5 }
  ];

  private readonly storageKey = 'bestlashes-cart-items';
  private readonly discountStorageKey = 'bestlashes-cart-discount';

  private readonly productCatalog: Record<string, Omit<BasketItem, 'quantity'>> = {
    'promo-pack': {
      id: 'promo-pack',
      name: 'Промо пакет „Ден и Нощ“',
      subtitle: 'Два чифта магнитни мигли + 2 линии и апликатор',
      price: 69,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761412141/Best_Lashes_Cover_Image__oipyfg.jpg'
    },
    'home-kit': {
      id: 'home-kit',
      name: 'Комплект „Миглопластика вкъщи“',
      subtitle: '120+ снопчета, лепило тип спирала и запечатващ гел',
      price: 69,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761412142/Best_Lashes_Cover_Image_2_hlfykp.jpg',
      tag: 'Най-продаван'
    }
  };

  items: BasketItem[] = [];

  appliedDiscount?: DiscountDefinition;
  discountMessage = '';
  discountState: 'idle' | 'success' | 'error' = 'idle';
  isSubmitting = false;

  private subscription?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.restoreItems();
    this.restoreDiscount();

    this.subscription = this.route.queryParamMap.subscribe((params) => {
      const addId = params.get('add');
      if (addId && this.productCatalog[addId]) {
        this.addItem(addId);
        this.router.navigate([], {
          queryParams: { add: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  get subtotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  get shipping(): number {
    if (!this.hasItems) {
      return 0;
    }
    return this.subtotal >= this.freeShippingThreshold ? 0 : this.defaultShippingFee;
  }

  get discountValue(): number {
    if (!this.appliedDiscount) {
      return 0;
    }
    if (this.appliedDiscount.percent) {
      return (this.subtotal * this.appliedDiscount.percent) / 100;
    }
    if (this.appliedDiscount.amount) {
      return Math.min(this.appliedDiscount.amount, this.subtotal);
    }
    return 0;
  }

  get total(): number {
    const value = this.subtotal - this.discountValue + this.shipping;
    return value > 0 ? value : 0;
  }

  get progressToFreeShipping(): number {
    if (!this.hasItems || this.subtotal >= this.freeShippingThreshold) {
      return 100;
    }
    return Math.min(100, (this.subtotal / this.freeShippingThreshold) * 100);
  }

  applyDiscount(code: string): void {
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      this.setDiscountFeedback('Моля, въведете код.', 'error');
      return;
    }

    const found = this.discounts.find((d) => d.code === normalized);

    if (!found) {
      this.appliedDiscount = undefined;
      this.setDiscountFeedback('Невалиден код. Проверете правописа.', 'error');
      localStorage.removeItem(this.discountStorageKey);
      return;
    }

    this.appliedDiscount = found;
    this.setDiscountFeedback(`Код ${found.code} е активиран${found.label ? ` (${found.label})` : ''}.`, 'success');
    this.persistDiscount(found.code);
  }

  adjustQuantity(item: BasketItem, delta: number): void {
    const next = item.quantity + delta;
    if (next <= 0) {
      this.removeItem(item.id);
      return;
    }
    item.quantity = Math.min(10, next);
    this.persistItems();
  }

  removeItem(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.persistItems();
    if (!this.hasItems) {
      this.clearDiscount();
    }
  }

  clearDiscount(): void {
    this.appliedDiscount = undefined;
    this.discountState = 'idle';
    this.discountMessage = '';
    localStorage.removeItem(this.discountStorageKey);
  }

  checkout(): void {
    if (!this.hasItems || this.isSubmitting) {
      return;
    }

    const payload: OrderPayload = {
      items: this.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      })),
      subtotal: this.subtotal,
      discountCode: this.appliedDiscount?.code ?? null,
      discountValue: this.discountValue,
      shipping: this.shipping,
      total: this.total
    };

    this.isSubmitting = true;

    // TODO: Replace with real backend request when API is ready
    // this.http.post('/ShoppingBasket/Order', payload).subscribe({
    //   next: () => this.handleOrderSuccess(payload),
    //   error: () => {
    //     this.isSubmitting = false;
    //     this.setDiscountFeedback('Възникна грешка. Опитайте отново.', 'error');
    //   }
    // });

    this.handleOrderSuccess(payload);
  }

  private setDiscountFeedback(message: string, state: 'success' | 'error'): void {
    this.discountMessage = message;
    this.discountState = state;
  }

  private addItem(id: string): void {
    const existing = this.items.find((item) => item.id === id);
    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + 1);
    } else {
      const product = this.productCatalog[id];
      if (!product) {
        return;
      }
      const newItem: BasketItem = {
        ...product,
        quantity: 1
      };
      this.items = [...this.items, newItem];
    }
    this.persistItems();
  }

  private persistItems(): void {
    if (this.items.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  private restoreItems(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }
    try {
      const parsed: BasketItem[] = JSON.parse(raw);
      this.items = parsed
        .map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }))
        .filter((item) => this.productCatalog[item.id]);
    } catch (e) {
      console.warn('Неуспешно зареждане на количката от локално съхранение.', e);
      this.items = [];
      localStorage.removeItem(this.storageKey);
    }
  }

  private persistDiscount(code: string): void {
    localStorage.setItem(this.discountStorageKey, code);
  }

  private restoreDiscount(): void {
    const storedCode = localStorage.getItem(this.discountStorageKey);
    if (!storedCode) {
      return;
    }
    const found = this.discounts.find((d) => d.code === storedCode);
    if (found) {
      this.appliedDiscount = found;
      this.discountState = 'success';
      this.discountMessage = `Код ${found.code} е активиран${found.label ? ` (${found.label})` : ''}.`;
    } else {
      localStorage.removeItem(this.discountStorageKey);
    }
  }

  private handleOrderSuccess(payload: OrderPayload): void {
    this.persistOrderSummary(payload);
    this.items = [];
    this.persistItems();
    this.clearDiscount();
    this.isSubmitting = false;
    this.router.navigate(['/thank-you'], { state: { order: payload } });
  }

  private persistOrderSummary(payload: OrderPayload): void {
    try {
      localStorage.setItem('bestlashes-last-order', JSON.stringify(payload));
    } catch (error) {
      console.warn('Неуспешно запазване на информация за поръчката.', error);
    }
  }
}
