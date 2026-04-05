import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NexoPanel } from './shared-ui';

describe('NexoPanel', () => {
  let component: NexoPanel;
  let fixture: ComponentFixture<NexoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NexoPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(NexoPanel);
    fixture.componentRef.setInput('title', 'Test');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
