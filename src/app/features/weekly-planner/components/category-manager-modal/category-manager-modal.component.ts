import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeeklyWorkStore } from '../../../../core/store';
import { CategoryItem, PRESET_CATEGORY_COLORS } from '../../../../core/models/category.model';
import { ModalDialogComponent } from '../../../../shared/ui/modal-dialog/modal-dialog.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-category-manager-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalDialogComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal-dialog
      [isOpen]="store.isCategoryManagerOpen()"
      title="Manage Categories"
      subtitle="Create custom categories and custom color badge tokens for your tasks."
      (closed)="onClose()"
    >
      <div class="space-y-6">
        
        <!-- Create / Edit Form Box -->
        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {{ editingCategoryId() ? 'Edit Category' : 'Create New Category' }}
            </h4>
            @if (editingCategoryId()) {
              <button
                type="button"
                (click)="resetForm()"
                class="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel Edit
              </button>
            }
          </div>

          <!-- Category Name Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              [(ngModel)]="categoryName"
              placeholder="e.g., Cricket Practice, University, Client Work"
              maxlength="30"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <!-- Color Swatches Palette -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Badge Color
            </label>
            <div class="flex items-center gap-2 flex-wrap">
              @for (preset of colorPresets; track preset.hex) {
                <button
                  type="button"
                  (click)="selectedColor.set(preset.hex)"
                  class="w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center focus:outline-none shrink-0"
                  [style.backgroundColor]="preset.hex"
                  [class.border-slate-900]="selectedColor() === preset.hex"
                  [class.dark:border-white]="selectedColor() === preset.hex"
                  [class.scale-110]="selectedColor() === preset.hex"
                  [class.shadow-sm]="selectedColor() === preset.hex"
                  [class.border-transparent]="selectedColor() !== preset.hex"
                  [title]="preset.name"
                >
                  @if (selectedColor() === preset.hex) {
                    <svg class="w-3.5 h-3.5 text-white drop-shadow-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                </button>
              }
            </div>
          </div>

          <!-- Live Preview -->
          <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">Live Preview:</span>
              <span
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded border transition-all truncate"
                [style.borderColor]="selectedColor() + '40'"
                [style.backgroundColor]="selectedColor() + '15'"
                [style.color]="selectedColor()"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.backgroundColor]="selectedColor()"></span>
                <span class="truncate">{{ categoryName.trim() || 'Category Name' }}</span>
              </span>
            </div>

            <app-button
              variant="primary"
              size="xs"
              [disabled]="!categoryName.trim()"
              (clicked)="saveCategory()"
            >
              {{ editingCategoryId() ? 'Update' : 'Add Category' }}
            </app-button>
          </div>
        </div>

        <!-- Existing Categories List -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Configured Categories ({{ store.categories().length }})
          </h4>

          <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            @for (cat of store.categories(); track cat.id) {
              <div
                class="flex items-center justify-between p-2.5 rounded-xl border transition-all bg-white dark:bg-[#12141c] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <!-- Category Tag Preview & Task Count -->
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded border truncate"
                    [style.borderColor]="cat.color + '40'"
                    [style.backgroundColor]="cat.color + '15'"
                    [style.color]="cat.color"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.backgroundColor]="cat.color"></span>
                    <span class="truncate">{{ cat.name }}</span>
                  </span>

                  <span class="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {{ getTaskCountForCategory(cat.id) }} tasks
                  </span>
                </div>

                <!-- Actions: Edit & Delete -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    (click)="editCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit category"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    (click)="deleteCategory(cat)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </app-modal-dialog>
  `
})
export class CategoryManagerModalComponent {
  readonly store = inject(WeeklyWorkStore);

  readonly colorPresets = PRESET_CATEGORY_COLORS;

  categoryName = '';
  selectedColor = signal<string>(PRESET_CATEGORY_COLORS[0].hex);
  editingCategoryId = signal<string | null>(null);

  getTaskCountForCategory(categoryId: string): number {
    return this.store.tasks().filter(t => t.categoryId === categoryId).length;
  }

  editCategory(cat: CategoryItem): void {
    this.editingCategoryId.set(cat.id);
    this.categoryName = cat.name;
    this.selectedColor.set(cat.color);
  }

  resetForm(): void {
    this.editingCategoryId.set(null);
    this.categoryName = '';
    this.selectedColor.set(PRESET_CATEGORY_COLORS[0].hex);
  }

  saveCategory(): void {
    if (!this.categoryName.trim()) return;

    const editId = this.editingCategoryId();
    if (editId) {
      this.store.updateCategory(editId, this.categoryName, this.selectedColor());
    } else {
      this.store.addCategory(this.categoryName, this.selectedColor());
    }

    this.resetForm();
  }

  deleteCategory(cat: CategoryItem): void {
    const taskCount = this.getTaskCountForCategory(cat.id);
    if (taskCount > 0) {
      const confirmed = confirm(
        `Category "${cat.name}" is currently used by ${taskCount} tasks. Deleting it will mark these tasks as "Uncategorized". Proceed?`
      );
      if (!confirmed) return;
    }

    this.store.deleteCategory(cat.id);
    if (this.editingCategoryId() === cat.id) {
      this.resetForm();
    }
  }

  onClose(): void {
    this.resetForm();
    this.store.closeCategoryManager();
  }
}
