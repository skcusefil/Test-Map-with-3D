import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MapboxThreeComponent } from './mapbox-three/mapbox-three.component';

@NgModule({
  declarations: [
    AppComponent,
    MapboxThreeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
