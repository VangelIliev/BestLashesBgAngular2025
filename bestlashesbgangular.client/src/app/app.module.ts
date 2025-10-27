import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeImageCardComponent } from './home-image-card/home-image-card.component';
import { ShoppingBasketComponent } from './shopping-basket/shopping-basket.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ThankYouPageComponent } from './thank-you-page/thank-you-page.component';
import { PromoPackageComponent } from './promo-package/promo-package.component';
import { HomeLashPackageComponent } from './home-lash-package/home-lash-package.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeImageCardComponent,
    ShoppingBasketComponent,
    ContactsComponent,
    AboutUsComponent,
    ThankYouPageComponent,
    PromoPackageComponent,
    HomeLashPackageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
