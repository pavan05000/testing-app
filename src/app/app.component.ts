import { LoaderComponent } from './loader/loader.component';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LoaderComponent,ScrollingModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone:true
})
export class AppComponent implements OnInit {
  title = 'Roboxa Project Management Application';
  isLoading:boolean= false;

  readonly destroyRef: DestroyRef = inject(DestroyRef);
  readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly titleService = inject(Title);


  constructor() {
    this.titleService.setTitle(this.title);
  }
  ngOnInit(): void {

    this.router.events.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });

  }

}
