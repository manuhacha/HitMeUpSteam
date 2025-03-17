import { TestBed } from '@angular/core/testing';

import { AutoLaunchService } from '../AutoLaunch/auto-launch.service';

describe('AutoLaunchService', () => {
  let service: AutoLaunchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoLaunchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
