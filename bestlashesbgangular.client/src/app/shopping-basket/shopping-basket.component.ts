import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

type DeliveryMethod = 'econt-office' | 'personal-address';

interface CustomerDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  isDataProcessingConsented: boolean;
}

type CheckoutFormValue = {
  firstName: string;
  lastName: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  gdprConsent: boolean;
};

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
  total: number;
  customer: CustomerDetails;
}

@Component({
  selector: 'app-shopping-basket',
  standalone: false,
  templateUrl: './shopping-basket.component.html',
  styleUrl: './shopping-basket.component.css'
})
export class ShoppingBasketComponent implements OnInit, OnDestroy {

  readonly discounts: DiscountDefinition[] = [
    { code: 'NEW10', percent: 10 },
    { code: 'CHRISTMAS10', percent: 10 }
  ];

  readonly deliveryOptions: Array<{ value: DeliveryMethod; label: string }> = [
    { value: 'econt-office', label: 'Офис на Еконт' },
    { value: 'personal-address', label: 'Личен адрес' }
  ];

  readonly deliveryPlaceholders: Record<DeliveryMethod, string> = {
    'econt-office': 'Въведи точен офис на Еконт (град, улица, номер)',
    'personal-address': 'Въведи пълен адрес (град, улица, номер, вход)'
  };

  checkoutForm!: FormGroup;
  checkoutError = '';
  private readonly phonePattern = /^(\+359|0)(?:[\s-]?\d){9}$/;

  private readonly storageKey = 'bestlashes-cart-items';
  private readonly discountStorageKey = 'bestlashes-cart-discount';
  private readonly customerStorageKey = 'bestlashes-checkout-customer';

  private readonly productCatalog: Record<string, Omit<BasketItem, 'quantity'>> = {
    'promo-pack': {
      id: 'promo-pack',
      name: 'Промо пакет „Ден и Нощ“',
      subtitle: 'Два чифта магнитни мигли + 2 линии и апликатор',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761412141/Best_Lashes_Cover_Image__oipyfg.jpg'
    },
    'home-kit-classic': {
      id: 'home-kit-classic',
      name: 'Комплект „Миглопластика вкъщи“ — Класически',
      subtitle: 'Перфектен за ежедневие, 8-16 мм',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761428114/Chocolate_Collection_1_bxvie6.jpg',
      tag: 'Най-продаван'
    },
    'home-kit-hybrid': {
      id: 'home-kit-hybrid',
      name: 'Комплект „Миглопластика вкъщи“ — Хибриден',
      subtitle: 'Комбинация от класически и обемни снопчета',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761428114/Natural_Migloplastic_2025_kupkmc.jpg'
    },
    'home-kit-foxy': {
      id: 'home-kit-foxy',
      name: 'Комплект „Миглопластика вкъщи“ — Фокси',
      subtitle: 'Ефект „очна линия“, L изивка',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1761428114/Fox_1_j02zw3.jpg'
    },
    'home-kit-natural': {
      id: 'home-kit-natural',
      name: 'Коледна Колекция',
      subtitle: 'Средна дължина и средна гъстота, 10-12-14 мм',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1765273209/viber_image_2025-12-09_11-27-09-778_odfnl5.jpg'
    },
    'home-kit-mega': {
      id: 'home-kit-mega',
      name: 'Комплект „Миглопластика вкъщи“ — МЕГА обем, МЕГА гъстота',
      subtitle: 'Супер гъсти и пухкави с D извивка, 8-16 мм',
      price: 35,
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_420,h_420,c_fill,q_auto,f_auto/v1762081030/viber_image_2025-11-02_12-01-00-060_tltu0w.jpg'
    }
  };

  items: BasketItem[] = [];

  appliedDiscount?: DiscountDefinition;
  discountMessage = '';
  discountState: 'idle' | 'success' | 'error' = 'idle';
  isSubmitting = false;

  private readonly subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly http: HttpClient,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.restoreItems();
    this.restoreDiscount();

    const querySubscription = this.route.queryParamMap.subscribe((params) => {
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
    this.subscriptions.add(querySubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  get subtotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
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
    const value = this.subtotal - this.discountValue;
    return value > 0 ? value : 0;
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
    this.checkoutError = '';

    if (!this.hasItems || this.isSubmitting) {
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.checkoutError = 'Моля, попълни данните за доставка преди да финализираш поръчката.';
      return;
    }

    const payload = this.createOrderPayload();

    this.isSubmitting = true;

    this.http.post<{ success: boolean; orderId?: string }>('/api/ShoppingBasket/checkout', payload).subscribe({
      next: () => this.handleOrderSuccess(payload),
      error: (error) => {
        this.isSubmitting = false;
        this.checkoutError = this.resolveCheckoutError(error);
      }
    });
  }

  getControl(name: keyof CheckoutFormValue): AbstractControl {
    return this.checkoutForm.get(name) as AbstractControl;
  }

  get selectedDeliveryMethod(): DeliveryMethod {
    return (this.getControl('deliveryMethod').value as DeliveryMethod) ?? this.deliveryOptions[0].value;
  }

  get deliveryAddressPlaceholder(): string {
    return this.deliveryPlaceholders[this.selectedDeliveryMethod] ?? '';
  }

  private buildForm(): void {
    const stored = this.restoreCustomer();

    this.checkoutForm = this.fb.group({
      firstName: [stored?.firstName ?? '', [Validators.required, Validators.minLength(2)]],
      lastName: [stored?.lastName ?? '', [Validators.required, Validators.minLength(2)]],
      phone: [stored?.phone ?? '', [Validators.required, Validators.pattern(this.phonePattern)]],
      deliveryMethod: [stored?.deliveryMethod ?? this.deliveryOptions[0].value, Validators.required],
      deliveryAddress: [stored?.deliveryAddress ?? '', [Validators.required, Validators.minLength(6)]],
      gdprConsent: [stored?.gdprConsent ?? false, Validators.requiredTrue]
    });

    const valueChangesSub = this.checkoutForm.valueChanges.subscribe((value) => {
      this.persistCustomer(value as CheckoutFormValue);
    });
    this.subscriptions.add(valueChangesSub);
  }

  private createOrderPayload(): OrderPayload {
    const customer = this.mapCustomerDetails();

    return {
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
      total: this.total,
      customer
    };
  }

  private mapCustomerDetails(): CustomerDetails {
    const value = this.checkoutForm.getRawValue() as CheckoutFormValue;

    return {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      phoneNumber: this.sanitizePhone(value.phone),
      deliveryMethod: value.deliveryMethod,
      deliveryAddress: this.sanitizeAddress(value.deliveryAddress),
      isDataProcessingConsented: value.gdprConsent === true
    };
  }

  private sanitizePhone(phone: string): string {
    return phone.trim().replace(/[\s-]+/g, '');
  }

  private sanitizeAddress(address: string): string {
    return address.replace(/\s+/g, ' ').trim();
  }

  private resolveCheckoutError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Нямаме връзка със сървъра. Провери интернет връзката си и опитай отново.';
      }

      if (error.status === 400) {
        if (typeof error.error === 'string' && error.error.length) {
          return error.error;
        }

        if (error.error?.errors) {
          const messages = Object.values(error.error.errors)
            .flat()
            .filter((message): message is string => typeof message === 'string');
          if (messages.length) {
            return messages[0];
          }
        }

        return 'Моля, провери въведената информация и опитай отново.';
      }

      if (error.status >= 500) {
        return 'Сървърът е временно недостъпен. Опитай отново след минута.';
      }
    }

    return 'Възникна неочаквана грешка. Опитай отново след малко.';
  }

  private persistCustomer(value: Partial<CheckoutFormValue>): void {
    try {
      localStorage.setItem(this.customerStorageKey, JSON.stringify(value));
    } catch (storageError) {
      console.warn('Неуспешно запазване на данните за клиента.', storageError);
    }
  }

  private restoreCustomer(): Partial<CheckoutFormValue> | undefined {
    const raw = localStorage.getItem(this.customerStorageKey);
    if (!raw) {
      return undefined;
    }

    try {
      return JSON.parse(raw) as Partial<CheckoutFormValue>;
    } catch (error) {
      console.warn('Неуспешно зареждане на данните за клиента от локално съхранение.', error);
      localStorage.removeItem(this.customerStorageKey);
      return undefined;
    }
  }

  private setDiscountFeedback(message: string, state: 'success' | 'error'): void {
    this.discountMessage = message;
    this.discountState = state;
  }

  private addItem(id: string): void {
    const product = this.productCatalog[id];
    if (!product) {
      return;
    }

    // домашните комплекти трябва да се добавят като отделни редове, без сумиране
    if (id.startsWith('home-kit')) {
      const newVariantItem: BasketItem = {
        ...product,
        quantity: 1
      };
      this.items = [...this.items, newVariantItem];
      this.persistItems();
      return;
    }

    const existing = this.items.find((item) => item.id === id);
    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + 1);
    } else {
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
      const restored: BasketItem[] = [];

      parsed.forEach((item) => {
        const catalogItem = this.productCatalog[item.id];
        if (!catalogItem) {
          return;
        }

        const restoredItem: BasketItem = {
          ...catalogItem,
          quantity: Number(item.quantity) || 1
        };

        // домашните комплекти се пазят като отделни редове, дори със същия id
        if (item.id.startsWith('home-kit')) {
          restored.push(restoredItem);
          return;
        }

        const existing = restored.find((existingItem) => existingItem.id === item.id);
        if (existing) {
          existing.quantity = Math.min(10, existing.quantity + restoredItem.quantity);
        } else {
          restored.push(restoredItem);
        }
      });

      this.items = restored;
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
    localStorage.removeItem(this.customerStorageKey);
    this.checkoutForm.reset({
      firstName: '',
      lastName: '',
      phone: '',
      deliveryMethod: this.deliveryOptions[0].value,
      deliveryAddress: '',
      gdprConsent: false
    });
    this.checkoutError = '';
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
