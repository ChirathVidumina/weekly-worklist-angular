import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeeklyWorkStore } from '../../../../core/store';
import { Priority, PRIORITY_METADATA } from '../../../../core/models/priority.enum';
import { TaskStatus } from '../../../../core/models/task.model';
import { ModalDialogComponent } from '../../../../shared/ui/modal-dialog/modal-dialog.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { AutoFocusDirective } from '../../../../shared/directives/auto-focus.directive';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalDialogComponent, ButtonComponent, AutoFocusDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal-dialog
      [isOpen]="store.isFormModalOpen()"
      [title]="isEditing ? 'Edit Task' : 'New Task'"
      [subtitle]="isEditing ? 'Update task specification and schedule.' : 'Schedule work into your weekly cadence.'"
      (closed)="onClose()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        
        <!-- Title Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Title <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            formControlName="title"
            appAutoFocus
            placeholder="e.g., Implement dark mode design tokens"
            class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            [class.border-rose-500]="form.get('title')?.touched && form.get('title')?.invalid"
          />
          @if (form.get('title')?.touched && form.get('title')?.invalid) {
            <p class="text-[11px] text-rose-500 mt-1">
              Title is required (at least 3 characters).
            </p>
          }
        </div>

        <!-- Date & Time Estimate Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <!-- Date -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date <span class="text-rose-500">*</span>
            </label>
            <input
              type="date"
              formControlName="date"
              class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- Time Estimate -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Duration
            </label>
            <div class="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                step="5"
                formControlName="estimatedMinutes"
                class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
              <span class="text-xs text-slate-500 font-mono">min</span>
            </div>
            <!-- Quick Chips -->
            <div class="flex items-center gap-1 mt-1.5 flex-wrap">
              @for (chip of durationChips; track chip.value) {
                <button
                  type="button"
                  (click)="setDuration(chip.value)"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-mono"
                >
                  {{ chip.label }}
                </button>
              }
            </div>
          </div>

        </div>

        <!-- Priority Selector -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Priority
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            @for (p of priorities; track p.key) {
              <button
                type="button"
                (click)="setPriority(p.key)"
                class="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer"
                [ngClass]="form.get('priority')?.value === p.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
              >
                <span class="w-2 h-2 rounded-full" [style.backgroundColor]="p.color"></span>
                <span>{{ p.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Category & Status Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <!-- Category -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <button
                type="button"
                (click)="store.openCategoryManager()"
                class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                + New Category
              </button>
            </div>
            <select
              formControlName="categoryId"
              class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
            >
              @for (cat of store.categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              formControlName="status"
              class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

        </div>

        <!-- Tags Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tags <span class="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            formControlName="tagsInput"
            placeholder="e.g., frontend, auth, sprint-46"
            class="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- Description Textarea -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Acceptance Criteria
          </label>
          <textarea
            rows="3"
            formControlName="description"
            placeholder="Add relevant links, notes, acceptance criteria, or PR details..."
            class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y"
          ></textarea>
        </div>

        <!-- Footer / Action Buttons -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          @if (isEditing) {
            <button
              type="button"
              (click)="onDelete()"
              class="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer focus:outline-none"
            >
              Delete Task
            </button>
          } @else {
            <div></div>
          }

          <div class="flex items-center gap-2">
            <app-button variant="ghost" size="sm" (clicked)="onClose()">
              Cancel
            </app-button>
            <app-button
              type="submit"
              variant="primary"
              size="sm"
              [disabled]="form.invalid"
            >
              {{ isEditing ? 'Save Changes' : 'Create Task' }}
            </app-button>
          </div>
        </div>

      </form>
    </app-modal-dialog>
  `
})
export class TaskFormModalComponent {
  readonly store = inject(WeeklyWorkStore);
  private readonly fb = inject(FormBuilder);

  readonly priorities = [
    PRIORITY_METADATA[Priority.URGENT],
    PRIORITY_METADATA[Priority.HIGH],
    PRIORITY_METADATA[Priority.MEDIUM],
    PRIORITY_METADATA[Priority.LOW]
  ];

  readonly durationChips = [
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1h', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2h', value: 120 }
  ];

  form: FormGroup;
  isEditing = false;
  editingTaskId: string | null = null;

  constructor() {
    const defaultCatId = this.store.categories()[0]?.id || 'cat-work';

    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: ['', Validators.required],
      priority: [Priority.MEDIUM, Validators.required],
      categoryId: [defaultCatId, Validators.required],
      status: ['TODO', Validators.required],
      estimatedMinutes: [30, [Validators.min(5)]],
      tagsInput: ['']
    });

    // Reactively populate form when editingTask changes
    effect(() => {
      const task = this.store.editingTask();
      const preselectedDate = this.store.modalPreselectedDate();
      const firstCatId = this.store.categories()[0]?.id || 'cat-work';

      if (task) {
        this.isEditing = true;
        this.editingTaskId = task.id;
        this.form.patchValue({
          title: task.title,
          description: task.description || '',
          date: task.date,
          priority: task.priority,
          categoryId: task.categoryId || firstCatId,
          status: task.status,
          estimatedMinutes: task.estimatedMinutes || 30,
          tagsInput: (task.tags || []).join(', ')
        });
      } else {
        this.isEditing = false;
        this.editingTaskId = null;
        this.form.reset({
          title: '',
          description: '',
          date: preselectedDate || new Date().toISOString().split('T')[0],
          priority: Priority.MEDIUM,
          categoryId: firstCatId,
          status: 'TODO',
          estimatedMinutes: 30,
          tagsInput: ''
        });
      }
    });
  }

  setPriority(p: Priority): void {
    this.form.patchValue({ priority: p });
  }

  setDuration(mins: number): void {
    this.form.patchValue({ estimatedMinutes: mins });
  }

  onClose(): void {
    this.store.closeModal();
  }

  onDelete(): void {
    if (this.editingTaskId) {
      this.store.deleteTask(this.editingTaskId);
      this.store.closeModal();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const val = this.form.value;
    const tags = val.tagsInput
      ? val.tagsInput.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];

    if (this.isEditing && this.editingTaskId) {
      this.store.updateTask(this.editingTaskId, {
        title: val.title.trim(),
        description: val.description?.trim(),
        date: val.date,
        priority: val.priority,
        categoryId: val.categoryId,
        status: val.status as TaskStatus,
        estimatedMinutes: Number(val.estimatedMinutes) || 30,
        tags
      });
    } else {
      this.store.createTask({
        title: val.title.trim(),
        description: val.description?.trim(),
        date: val.date,
        priority: val.priority,
        categoryId: val.categoryId,
        status: val.status as TaskStatus,
        estimatedMinutes: Number(val.estimatedMinutes) || 30,
        tags
      });
    }
  }
}
