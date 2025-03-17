import { TestBed } from '@angular/core/testing';

import { SteamAPIService } from '../Steam/steam-api.service';

describe('SteamAPIService', () => {
  let service: SteamAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SteamAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
