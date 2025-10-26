import { Component } from '@angular/core';

type HomePackage = {
  id: string;
  name: string;
  price: string;
  description: string;
  image?: string;
  imageAlt?: string;
  link?: string;
  ctaLabel?: string;
};

@Component({
  selector: 'app-home-image-card',
  standalone: false,
  templateUrl: './home-image-card.component.html',
  styleUrl: './home-image-card.component.css'
})
export class HomeImageCardComponent {
  readonly packages: HomePackage[] = [
    {
      id: 'home-lash-pack',
      name: 'Миглопластика вкъщи',
      price: '69 лв',
      description: 'Всичко необходимо, за да направиш миглопластика вкъщи като професионалист.',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_840,h_620,c_fill,q_auto,f_auto/v1761412142/Best_Lashes_Cover_Image_2_hlfykp.jpg',
      imageAlt: 'Комплект за миглопластика вкъщи',
      link: '/home-lash-package',
      ctaLabel: 'Виж повече'
    },
    {
      id: 'promo-pack',
      name: 'Промо пакет',
      price: '69 лв',
      description: 'Пълен комплект за магнетичен поглед + аксесоари за бързо приложение.',
      image: 'https://res.cloudinary.com/dl6dp2cr0/image/upload/w_840,h_620,c_fill,q_auto,f_auto/v1761412141/Best_Lashes_Cover_Image__oipyfg.jpg',
      imageAlt: 'Промо пакет Best Lashes BG',
      link: '/promo-package',
      ctaLabel: 'Виж повече'
    }
  ];

  onImageError(pkg: HomePackage): void {
    pkg.image = undefined;
  }
}
