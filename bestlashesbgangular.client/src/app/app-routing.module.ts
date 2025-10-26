import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeImageCardComponent } from './home-image-card/home-image-card.component';
import { ShoppingBasketComponent } from './shopping-basket/shopping-basket.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ThankYouPageComponent } from './thank-you-page/thank-you-page.component';
import { PromoPackageComponent } from './promo-package/promo-package.component';
import { HomeLashPackageComponent } from './home-lash-package/home-lash-package.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeImageCardComponent },
  { path: 'promo-package', component: PromoPackageComponent },
  { path: 'home-lash-package', component: HomeLashPackageComponent },
  { path: 'shopping-basket', component: ShoppingBasketComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'thank-you', component: ThankYouPageComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
