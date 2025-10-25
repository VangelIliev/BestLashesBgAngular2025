import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ReviewCardComponent } from './review-card/review-card.component';
import { HomeImageCardComponent } from './home-image-card/home-image-card.component';
import { LashesComponent } from './lashes/lashes.component';
import { LashComponent } from './lash/lash.component';
import { ShoppingBasketComponent } from './shopping-basket/shopping-basket.component';
import { ContactsComponent } from './contacts/contacts.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ThankYouPageComponent } from './thank-you-page/thank-you-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ReviewsComponent,
    ReviewCardComponent,
    HomeImageCardComponent,
    LashesComponent,
    LashComponent,
    ShoppingBasketComponent,
    ContactsComponent,
    AboutUsComponent,
    ThankYouPageComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
