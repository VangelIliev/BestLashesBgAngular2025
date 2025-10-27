import { Component } from '@angular/core';

interface LashVariant {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface KitDetail {
  title: string;
  items: string[];
}

@Component({
  selector: 'app-home-lash-package',
  standalone: false,
  templateUrl: './home-lash-package.component.html',
  styleUrl: './home-lash-package.component.css'
})
export class HomeLashPackageComponent {
  readonly demoVideoSrc = 'https://res.cloudinary.com/dl6dp2cr0/video/upload/v1761427399/Migloplastic_oghxpg.mp4';
  readonly demoVideoPoster = 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428362/Summer_Collection_1_o2pjun.jpg';

  readonly variants: LashVariant[] = [
    {
      id: 'home-kit-classic',
      name: 'Класическа миглопластика',
      description: 'Перфектна за ежедневие, 8-16 мм',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428114/Chocolate_Collection_1_bxvie6.jpg'
    },
    {
      id: 'home-kit-hybrid',
      name: 'Хибридна миглопластика',
      description: 'Комбинация от класически и обемни снопчета за по-богат ефект, 12-14-16мм.',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428114/Natural_Migloplastic_2025_kupkmc.jpg'
    },
    {
      id: 'home-kit-foxy',
      name: 'Фокси миглопластика',
      description: 'Ефект "очна линия", L изивка',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428114/Fox_1_j02zw3.jpg'
    },
    {
      id: 'home-kit-natural',
      name: 'Естествена Колекция',
      description: 'Нежен ефект "косъм по косъм", 10-12 мм',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428362/Summer_Collection_1_o2pjun.jpg'
    },
    {
      id: 'home-kit-mega',
      name: '6D Мега обем',
      description: 'Супер гъсти и пухкави с D извивка, 8-16 мм',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761428115/6d_vzjyok.jpg'
    }
  ];

  readonly kitDetails: KitDetail[] = [
    {
      title: 'Включва',
      items: [
        '120+ снопчета за многократно ползване',
        'Лепило тип "спирала" и запечатващ гел',
        'Пинсета',
        'Четка за разресване',
        'Четка за почистване',
        'Remover за безопасно премахване'
      ]
    },
    {
      title: 'Предимства',
      items: [
        'Лесно поставяне под 10 минути в домашни условия',
        'Резултат до 2–3 седмици при правилна поддръжка',
        'Снопчетата могат да се използват повече от година'
      ]
    }
  ];

  activeVariant = this.variants[0];

  selectVariant(variant: LashVariant): void {
    this.activeVariant = variant;
  }
}

