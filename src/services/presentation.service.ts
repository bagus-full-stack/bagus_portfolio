export interface PresentationState {
  active: boolean;
  currentSection: number;
  totalSections: number;
}

class PresentationModeServiceClass {
  private active = false;
  private currentSection = 0;
  private totalSections = 8;
  private listeners: Set<(state: PresentationState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      this.toggle();
    } else if (this.active) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.nextSection();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.previousSection();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.deactivate();
      }
    }
  };

  activate(): void {
    if (!this.active) {
      this.active = true;
      this.currentSection = 0; // Start at first section
      this.notify();
    }
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      this.notify();
    }
  }

  toggle(): void {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  nextSection(): void {
    if (this.active && this.currentSection < this.totalSections - 1) {
      this.currentSection++;
      this.notify();
    }
  }

  previousSection(): void {
    if (this.active && this.currentSection > 0) {
      this.currentSection--;
      this.notify();
    }
  }

  subscribe(callback: (state: PresentationState) => void) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  private getState(): PresentationState {
    return {
      active: this.active,
      currentSection: this.currentSection,
      totalSections: this.totalSections
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }
}

export const PresentationModeService = new PresentationModeServiceClass();
