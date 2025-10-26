import { Component } from '@angular/core';

interface PackageSection {
  title: string;
  icon?: string;
  items: string[];
}

@Component({
  selector: 'app-promo-package',
  standalone: false,
  templateUrl: './promo-package.component.html',
  styleUrl: './promo-package.component.css'
})
export class PromoPackageComponent {
  readonly promoVideoSrc = 'https://res.cloudinary.com/dl6dp2cr0/video/upload/v1761427397/VideoDayAndNight_wp4am5.mp4';
  readonly promoVideoPoster = 'https://res.cloudinary.com/dl6dp2cr0/video/upload/v1761427397/VideoDayAndNight_wp4am5.mp4';
  readonly productImage = 'https://res.cloudinary.com/dl6dp2cr0/image/upload/v1761427556/NightAndDayImagePromo_lkjrad.jpg';

  readonly daySection: PackageSection = {
    title: 'Комплект “Ден” ☀️',
    items: [
      'Мигли “естествено ОТВОРЕНО око” 8 – 10 mm',
      'Бежова магнитна очна линия за нежна визия'
    ]
  };

  readonly nightSection: PackageSection = {
    title: 'Комплект “Нощ” 🌙',
    items: [
      'Мигли “гъсто КОТЕШКО око” 12 – 14 mm',
      'Дълбока черна магнитна очна линия за драматичен ефект'
    ]
  };

  readonly perks: string[] = [
    'Мигли от естествен косъм',
    'Лесно поставяне за под 5 минути',
    'Подходящо за многократна употреба'
  ];

  readonly whatsInside: string[] = [
    '2 чифта магнитни мигли (ден и нощ)',
    '2 магнитни очни линии',
    'Апликатор за лесно поставяне',
    'Луксозна кутия за съхранение'
  ];
}

