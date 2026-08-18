<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex justify-end">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" @click="$emit('close')"></div>

      <!-- Side panel -->
      <div class="relative w-full max-w-[1100px] h-full bg-white dark:bg-dark-100 shadow-2xl flex flex-col animate-slide-in-right">
        <!-- Loading state -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="issue">
          <!-- Banner require due date -->
          <div
            v-if="requireDueDate && !form.due_date"
            class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 text-sm flex items-center justify-center font-medium border-b border-red-100 dark:border-red-900/50"
          >
            Vui lòng nhập Hạn chót để hoàn tất tác vụ này!
          </div>

          <!-- Header -->
          <div class="flex items-center gap-3 px-6 py-4 border-b border-surface-200 dark:border-dark-50 flex-shrink-0">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <IssueTypeIcon :type="issue.issue_type" class="w-4 h-4 flex-shrink-0" />
              <span class="text-xs font-mono text-gray-400">{{ issue.issue_key }}</span>
              <CopyButton :text="issue.issue_key" :label="issue.issue_key" size="xs" />
              <span class="text-xs text-gray-300">·</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ issue.project_name || '' }}</span>
              <template v-if="issue.epic_key && issue.issue_type !== 'epic'">
                <span class="text-xs text-gray-300">·</span>
                <span class="text-xs text-purple-600 dark:text-purple-400 font-medium">{{ issue.epic_key }}</span>
              </template>
            </div>
            <div class="flex items-center gap-1">
              <button
                v-if="issue.can_escalate && !issue.is_escalated"
                @click="escalateIssue"
                class="btn-ghost btn-sm text-red-500"
                title="Báo đỏ task — yêu cầu nhân sự xử lý gấp"
              >
                🚩 Báo đỏ
              </button>
              <button
                v-else-if="issue.can_escalate && issue.is_escalated"
                @click="unescalateIssue"
                class="btn-ghost btn-sm text-gray-400"
                title="Gỡ báo đỏ"
              >
                Gỡ báo đỏ
              </button>
              <button @click="editingTitle = true" v-if="!editingTitle" class="btn-ghost btn-sm" title="Sửa tiêu đề (E)">
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button @click="$emit('close')" class="btn-ghost btn-icon" title="Đóng (Esc)">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row flex-1 min-h-0 lg:divide-x divide-surface-200 dark:divide-dark-50">
            <!-- Main content -->
            <div class="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto min-h-0">
              <button
                type="button"
                class="lg:hidden btn-secondary btn-sm w-full justify-center"
                @click="showMetaMobile = !showMetaMobile"
              >
                {{ showMetaMobile ? 'Ẩn thông tin task' : 'Hiện thông tin task' }}
              </button>

              <!-- Banner báo đỏ -->
              <div
                v-if="issue.is_escalated"
                class="flex items-start gap-2 rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm"
              >
                <span class="text-base leading-none">🚩</span>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-red-700 dark:text-red-300">Task bị báo đỏ — cần xử lý gấp</p>
                  <p v-if="issue.escalation_note" class="text-xs text-red-600 dark:text-red-400 mt-0.5 whitespace-pre-wrap">{{ issue.escalation_note }}</p>
                </div>
              </div>

              <!-- Title -->
              <div>
                <input
                  v-if="editingTitle"
                  v-model="form.title"
                  @blur="saveTitle"
                  @keydown.enter="saveTitle"
                  @keydown.escape="editingTitle = false"
                  class="input text-xl font-bold"
                  autofocus
                />
                <h1
                  v-else
                  @dblclick="editingTitle = true"
                  class="text-xl font-bold text-gray-900 dark:text-white cursor-text hover:bg-surface-50 dark:hover:bg-dark-50 rounded px-1 -mx-1 py-0.5 transition-colors"
                >
                  {{ issue.title }}
                </h1>
              </div>

              <!-- Description -->
              <div>
                <div
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Mô tả
                </div>
                <div
                  v-if="!editingDesc"
                  @click="onDescClick"
                  class="issue-rich-description text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-text min-h-[60px] p-2 -mx-2 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 transition-colors"
                >
                  <div
                    v-if="issue.description"
                    v-html="issue.description"
                  />
                  <span v-else class="text-gray-400 italic">Thêm mô tả...</span>
                </div>
                <div v-else>
                  <RichTextEditor
                    v-model="form.description"
                    placeholder="Mô tả issue... (heading, danh sách, ảnh dán trực tiếp)"
                    min-height="220px"
                  />
                  <div class="flex items-center gap-2 mt-2">
                    <button type="button" @click="saveDescription" class="btn-primary btn-sm">
                      Lưu
                    </button>
                    <button
                      type="button"
                      @click="cancelDescription"
                      class="btn-secondary btn-sm"
                    >
                      Hủy
                    </button>
                    <div class="flex-1"></div>
                    <button
                      @click="descFileInput?.click()"
                      class="btn-ghost btn-sm text-gray-400"
                      title="Đính kèm file"
                    >
                      <PaperClipIcon class="w-3.5 h-3.5" />
                      Đính kèm
                    </button>
                    <input
                      ref="descFileInput"
                      type="file"
                      multiple
                      class="hidden"
                      @change="handleDescFileSelect"
                    />
                  </div>
                  <div v-if="descUploading" class="mt-2 space-y-1">
                    <div
                      v-for="(f, i) in descUploadingFiles"
                      :key="i"
                      class="flex items-center gap-2 text-xs"
                    >
                      <span class="flex-1 truncate text-gray-500">{{
                        f.name
                      }}</span>
                      <div
                        class="w-16 h-1 bg-surface-200 dark:bg-dark-50 rounded-full overflow-hidden"
                      >
                        <div
                          class="h-full bg-brand-500 rounded-full transition-all"
                          :style="{ width: f.progress + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Inline attachments -->
                <div v-if="descAttachments.length > 0" class="mt-3">
                  <div class="text-xs text-gray-400 mb-1.5">
                    {{ descAttachments.length }} file đính kèm
                  </div>
                  <div class="space-y-0.5">
                    <div
                      v-for="att in descAttachments"
                      :key="att.id"
                      class="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 group transition-colors"
                    >
                      <img
                        v-if="isDescImage(att.content_type)"
                        :src="att.file_url"
                        :alt="att.filename"
                        class="w-6 h-6 rounded object-cover flex-shrink-0"
                      />
                      <PaperClipIcon
                        v-else
                        class="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      />
                      <a
                        :href="att.file_url"
                        target="_blank"
                        class="flex-1 truncate text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {{ att.filename }}
                      </a>
                      <span class="text-gray-400 flex-shrink-0">{{
                        formatDescSize(att.file_size)
                      }}</span>
                      <button
                        @click.stop="deleteDescAttachment(att.id)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-0.5 rounded"
                        title="Xóa"
                      >
                        <XMarkIcon class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Epic children (story/task) -->
              <div v-if="issue.issue_type === 'epic'">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Issue trong Epic
                  <span v-if="issue.epic_progress" class="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 rounded">
                    {{ issue.epic_progress.child_done_count }}/{{ issue.epic_progress.child_count }} done
                    · {{ issue.epic_progress.completion_pct }}%
                  </span>
                </div>
                <div v-if="issue.epic_children?.length" class="space-y-1.5 mb-3">
                  <button
                    v-for="ch in issue.epic_children"
                    :key="ch.id"
                    type="button"
                    class="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 text-left"
                    @click="openChildIssue(ch.id)"
                  >
                    <IssueTypeIcon :type="ch.issue_type" class="w-3.5 h-3.5" />
                    <span class="text-xs font-mono text-gray-400">{{ ch.issue_key }}</span>
                    <span class="text-sm truncate flex-1">{{ ch.title }}</span>
                    <span class="badge text-xs">{{ ch.status }}</span>
                  </button>
                </div>
                <p v-else class="text-sm text-gray-400">Chưa có story/task. Tạo issue và chọn epic này.</p>
              </div>

              <!-- Subtasks -->
              <div
                v-if="issue.subtasks?.length || (issue.issue_type !== 'subtask' && issue.issue_type !== 'epic')"
              >
                <div
                  class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"
                >
                  Subtasks
                  <span
                    class="text-xs bg-surface-200 dark:bg-dark-50 px-1.5 rounded text-gray-500"
                  >
                    {{
                      issue.subtasks?.filter((s: any) => s.status === "done")
                        .length || 0
                    }}/{{ issue.subtasks?.length || 0 }}
                  </span>
                </div>
                <div class="space-y-1.5">
                  <div
                    v-for="sub in issue.subtasks"
                    :key="sub.id"
                    class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-dark-50 group"
                  >
                    <input
                      type="checkbox"
                      :checked="sub.status === 'done'"
                      @change="toggleSubtask(sub)"
                      class="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span
                      :class="
                        sub.status === 'done'
                          ? 'line-through text-gray-400'
                          : 'text-sm text-gray-800 dark:text-gray-200'
                      "
                    >
                      {{ sub.title }}
                    </span>
                    <UserAvatar
                      v-if="sub.assignee"
                      :user="sub.assignee"
                      size="xs"
                      class="ml-auto"
                    />
                  </div>
                </div>
                <!-- Add subtask -->
                <div v-if="addingSubtask" class="flex items-center gap-2 mt-2">
                  <input
                    v-model="newSubtaskTitle"
                    @keydown.enter="createSubtask"
                    @keydown.escape="addingSubtask = false"
                    class="input text-sm flex-1"
                    placeholder="Tiêu đề subtask..."
                    autofocus
                  />
                  <button @click="createSubtask" class="btn-primary btn-sm">
                    Thêm
                  </button>
                  <button
                    @click="addingSubtask = false"
                    class="btn-secondary btn-sm"
                  >
                    Hủy
                  </button>
                </div>
                <button
                  v-else
                  @click="addingSubtask = true"
                  class="btn-ghost btn-sm mt-2 text-gray-400"
                >
                  <PlusIcon class="w-3.5 h-3.5" />
                  Thêm subtask
                </button>
              </div>

              <!-- Tabs: Comments / Attachments / History -->
              <div>
                <div
                  class="flex items-center gap-1 border-b border-surface-200 dark:border-dark-50 mb-4 overflow-x-auto"
                >
                  <button
                    v-for="t in detailTabs"
                    :key="t.key"
                    @click="detailTab = t.key"
                    class="px-3 py-1.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors flex items-center gap-1.5"
                    :class="
                      detailTab === t.key
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    "
                  >
                    {{ t.label }}
                    <span
                      v-if="t.badge"
                      class="bg-red-500 text-white text-[9px] font-bold px-1 rounded-full"
                      >{{ t.badge }}</span
                    >
                  </button>
                </div>

                <!-- QA / Testing panel -->
                <QATestingPanel
                  v-if="detailTab === 'qa'"
                  :issue="issue"
                  :on-updated="onQAUpdated"
                />

                <!-- Dev submit button -->
                <!-- <DevSubmitButton
                  v-else-if="detailTab === 'dev'"
                  :issue="issue"
                  @updated="issue = { ...issue, ...$event }"
                /> -->

                <IssueGitCommits
                  v-else-if="detailTab === 'git-commits'"
                  :issue-id="issue.id"
                />

                <!-- Time report -->
                <IssueTimeReport
                  v-else-if="detailTab === 'time'"
                  :issue-id="issue.id"
                />

                <IssueComments
                  v-else-if="detailTab === 'comments'"
                  :issue-id="issue.id"
                  :project-id="issue.project"
                />

                <IssueAttachments
                  v-else-if="detailTab === 'attachments'"
                  :issue-id="issue.id"
                />

                <IssueAiBriefPanel
                  v-else-if="detailTab === 'ai-brief'"
                  layout="tab"
                  :issue-id="issue.id"
                  :initial-brief="issue.ai_brief"
                  :initial-generated-at="issue.ai_brief_generated_at"
                  @updated="onAiBriefUpdated"
                />

                <AIEstimatePanel
                  v-else-if="detailTab === 'ai-estimate'"
                  layout="tab"
                  :issue-id="issue.id"
                  :initial-estimate="issue.ai_estimate"
                  @updated="onAiEstimateUpdated"
                />

                <div v-else-if="detailTab === 'history'" class="space-y-2">
                  <div
                    v-if="!issue.history?.length"
                    class="text-xs text-gray-400 text-center py-4"
                  >
                    Chưa có lịch sử thay đổi
                  </div>
                  <div
                    v-for="h in issue.history"
                    :key="h.id"
                    class="flex items-start gap-2.5 text-xs"
                  >
                    <UserAvatar
                      :user="h.user"
                      size="xs"
                      class="mt-0.5 flex-shrink-0"
                    />
                    <div class="flex-1">
                      <span
                        class="font-medium text-gray-700 dark:text-gray-300"
                        >{{ h.user?.full_name }}</span
                      >
                      <span class="text-gray-400"> đổi </span>
                      <span
                        class="font-medium text-gray-600 dark:text-gray-400"
                        >{{ h.field }}</span
                      >
                      <span class="text-gray-400"> từ </span>
                      <span
                        class="font-mono bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1 rounded"
                        >{{ h.old_value || "—" }}</span
                      >
                      <span class="text-gray-400"> → </span>
                      <span
                        class="font-mono bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-1 rounded"
                        >{{ h.new_value || "—" }}</span
                      >
                      <span class="text-gray-300 ml-2">{{
                        timeAgo(h.created_at)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar metadata -->
            <div
              v-show="showMetaMobile || !isMobileViewport"
              class="lg:w-80 w-full flex-shrink-0 p-4 sm:p-5 space-y-4 bg-surface-50 dark:bg-dark-50/50 overflow-y-auto border-t lg:border-t-0 border-surface-200 dark:border-dark-50 max-h-[45vh] lg:max-h-none"
            >

              <!-- Status -->
              <MetaField label="Trạng thái">
                <select
                  v-model="form.status"
                  @change="saveField('status', form.status)"
                  class="input text-xs py-1.5"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="testing">Testing</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </MetaField>

              <!-- Assignee -->
              <MetaField label="Người phụ trách">
                <UserSelect
                  v-model="form.assignee_id"
                  :project-id="issue.project"
                  @update:model-value="saveField('assignee', form.assignee_id)"
                />
              </MetaField>

              <MetaField v-if="issue.tester" label="Người kiểm tra">
                <div class="flex items-center gap-2">
                  <UserAvatar :user="issue.tester" size="xs" />
                  <span class="text-xs text-gray-700 dark:text-gray-300">{{ issue.tester.full_name }}</span>
                </div>
              </MetaField>

              <!-- Priority -->
              <MetaField label="Độ ưu tiên">
                <select
                  v-model="form.priority"
                  @change="saveField('priority', form.priority)"
                  class="input text-xs py-1.5"
                >
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </MetaField>

              <!-- Epic (story / task) -->
              <MetaField v-if="showEpicPicker" label="Epic">
                <select
                  v-model="form.parent_id"
                  class="input text-xs py-1.5"
                  @change="onEpicChange"
                >
                  <option :value="null">— Không thuộc epic —</option>
                  <option
                    v-for="ep in epicOptions"
                    :key="ep.id"
                    :value="ep.id"
                  >
                    {{ ep.issue_key }} — {{ ep.title }}
                  </option>
                </select>
                <p v-if="!epicOptions.length" class="text-[10px] text-gray-400 mt-1">
                  Chưa có epic trong project. Tạo epic ở tab Epic.
                </p>
              </MetaField>

              <!-- Sprint -->
              <MetaField label="Sprint">
                <select
                  v-model="form.sprint_id"
                  @change="saveField('sprint', form.sprint_id || null)"
                  :class="{ 'opacity-50 cursor-not-allowed': !form.due_date }"
                  :disabled="!form.due_date"
                  class="input text-xs py-1.5"
                >
                  <option :value="null">Backlog</option>
                  <option
                    v-for="sprint in sprints"
                    :key="sprint.id"
                    :value="sprint.id"
                  >
                    {{ sprint.name }}
                  </option>
                </select>
              </MetaField>

              <!-- Story Points -->
              <MetaField label="Story Points">
                <input
                  v-model.number="form.story_points"
                  type="number"
                  min="0"
                  max="100"
                  @blur="saveField('story_points', form.story_points)"
                  class="input text-xs py-1.5 w-24"
                  placeholder="0"
                />
              </MetaField>

              <!-- Thời gian giao hoàn thành -->
              <MetaField label="Thời gian hoàn thành">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="form.estimated_minutes"
                      type="number"
                      min="1"
                      max="120"
                      class="input text-xs py-1.5 w-20 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Phút"
                      :disabled="!canEditEstimated"
                      @blur="canEditEstimated && saveEstimated()"
                    />
                    <span class="text-xs text-gray-400">phút</span>
                  </div>
                  <div v-if="form.estimated_minutes" class="text-[11px] text-gray-400">
                    ≈ {{ formatEstimated(form.estimated_minutes) }}
                  </div>
                  <!-- Hiển thị gợi ý khi bị lock -->
                  <div v-if="!canEditEstimated" class="text-[10px] text-orange-400">
                    Chỉ sửa được khi issue ở To Do
                  </div>
                  <div v-else class="text-[10px] text-gray-300">Tối đa 120 phút (2 giờ)</div>
                </div>
              </MetaField>

              <!-- Due Date -->
              <MetaField label="Hạn chót">
                <input
                  v-model="form.due_date"
                  type="date"
                  @change="onDueDateChange"
                  class="input text-xs py-1.5"
                />
              </MetaField>

              <!-- Reporter -->
              <MetaField label="Người tạo">
                <div class="flex items-center gap-2">
                  <UserAvatar :user="issue.reporter" size="xs" />
                  <span class="text-xs text-gray-700 dark:text-gray-300">{{
                    issue.reporter?.full_name
                  }}</span>
                </div>
              </MetaField>

              <!-- Dates -->
              <MetaField label="Ngày tạo">
                <span class="text-xs text-gray-500">{{
                  formatDate(issue.created_at)
                }}</span>
              </MetaField>

              <!-- Keyboard shortcuts hint -->
              <div class="pt-3 border-t border-surface-200 dark:border-dark-50">
                <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phím tắt</div>
                <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div class="flex items-center justify-between"><span>Sửa tiêu đề</span><kbd class="kbd">E</kbd></div>
                  <div class="flex items-center justify-between"><span>Sửa mô tả</span><kbd class="kbd">M</kbd></div>
                  <div class="flex items-center justify-between"><span>Lưu</span><span class="flex items-center gap-1"><kbd class="kbd">{{ modKey }}</kbd>+<kbd class="kbd">Enter</kbd></span></div>
                  <div class="flex items-center justify-between"><span>Đóng / Hủy</span><kbd class="kbd">Esc</kbd></div>
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-2 border-t border-surface-200 dark:border-dark-50 space-y-2">
                <button
                  type="button"
                  @click="duplicateOpen = true"
                  class="btn-secondary btn-sm w-full justify-center"
                  title="Tạo issue mới với nội dung tương tự"
                >
                  <DocumentDuplicateIcon class="w-3.5 h-3.5" />
                  Duplicate issue
                </button>
                <button
                  @click="deleteIssue"
                  class="btn-danger btn-sm w-full justify-center"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                  Xóa issue
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Duplicate flow -->
      <CreateIssueModal
        v-if="duplicateOpen && issue"
        :project-id="issue.project"
        :sprint-id="issue.sprint || undefined"
        :default-status="issue.status"
        :prefill="duplicatePrefill"
        @close="duplicateOpen = false"
        @created="onDuplicateCreated"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PaperClipIcon,
  DocumentDuplicateIcon,
} from "@heroicons/vue/24/outline";
import { format } from "date-fns";
import { useMediaQuery } from "@vueuse/core";

const toast = useToast();
const props = defineProps<{ issueId: number; requireDueDate?: boolean }>();
const emit = defineEmits(["close", "updated", "deleted", "navigate-issue"]);

function openChildIssue(id: number) {
  emit("navigate-issue", id);
}

const issuesStore = useIssuesStore();
const projectsStore = useProjectsStore();
const api = useApi();
const canEditEstimated = computed(() => issue.value?.status === 'todo');

const issue = ref<any>(null);
const loading = ref(true);
const editingTitle = ref(false);
const editingDesc = ref(false);
const duplicateOpen = ref(false);
const addingSubtask = ref(false);
const newSubtaskTitle = ref("");

const tabLoaded = reactive({
  attachments: false,
  qa: false,
  dev: false,
  time: false,
  comments: false,
});

const detailTab = ref("comments");
const showMetaMobile = ref(false);
const isMobileViewport = useMediaQuery("(max-width: 1023px)");
watch(detailTab, async (tab) => {
  if (!issue.value) return;

  if (tab === "qa" && !tabLoaded.qa) {
    if (issue.value.project) {
      await projectsStore.fetchSprints(issue.value.project);
      tabLoaded.qa = true;
    }
  }

  if (tab === "dev" && !tabLoaded.dev) {
    if (issue.value.project) {
      await projectsStore.fetchSprints(issue.value.project);
      tabLoaded.dev = true;
    }
  }

  if (tab === "time" && !tabLoaded.time) {
    tabLoaded.time = true;
  }

  if (tab === "comments" && !tabLoaded.comments) {
    tabLoaded.comments = true;
  }
});

const detailTabs = computed(() => {
  const tabs = [
    {
      key: "qa",
      label: "🧪 QA / Testing",
      badge:
        issue.value?.open_bug_count > 0 ? issue.value.open_bug_count : null,
    },
    // { key: "dev", label: "🚀 Dev Submit" },
    { key: "time", label: "⏱ Thời gian" },
    { key: "comments", label: "Bình luận" },
    { key: "attachments", label: "Files" },
    { key: "history", label: "Lịch sử" },
    { key: 'git-commits', label: 'Git Commits' },
    {
      key: 'ai-brief',
      label: 'Gợi ý AI',
      badge: issue.value?.ai_brief ? '✓' : null,
    },
    {
      key: 'ai-estimate',
      label: '🤖 AI Estimate',
      badge: issue.value?.ai_estimate
        ? (issue.value.ai_estimate.sp_final ?? issue.value.ai_estimate.sp_suggested)
        : null,
    },
  ];
  return tabs;
});

function onQAUpdated(updatedIssue: any) {
  issue.value = { ...issue.value, ...updatedIssue };
}

const { openLightbox } = useLightbox();
// Bấm ảnh trong mô tả → mở popup xem to (không vào chế độ sửa)
function onDescClick(e: MouseEvent) {
  const t = e.target as HTMLElement;
  if (t && t.tagName === "IMG") {
    const img = t as HTMLImageElement;
    if (img.src) {
      e.stopPropagation();
      openLightbox(img.src, { alt: img.alt || "" });
      return;
    }
  }
  editingDesc.value = true;
}

function onAiBriefUpdated(payload: { brief: string; mode: string; generated_at: string | null }) {
  if (!issue.value) return;
  issue.value.ai_brief = payload.brief;
  issue.value.ai_brief_generated_at = payload.generated_at;
}

function onAiEstimateUpdated(payload: { ai_estimate: any; story_points?: number | null }) {
  if (!issue.value) return;
  issue.value.ai_estimate = payload.ai_estimate;
  if (payload.story_points != null) {
    issue.value.story_points = payload.story_points;
    if (form) form.story_points = payload.story_points;
  }
}

async function escalateIssue() {
  if (!issue.value) return;
  const note = (window.prompt("Lý do báo đỏ (gửi kèm thông báo cho nhân sự):", "") ?? "").trim();
  try {
    const res = await api.post(`/api/issues/${issue.value.id}/escalate/`, { note });
    issue.value = { ...issue.value, ...res };
    emit("updated", issue.value);
    toast.success("Đã báo đỏ task — nhân sự được thông báo");
  } catch (e: any) {
    toast.error(e?.data?.detail || "Không báo đỏ được");
  }
}

async function unescalateIssue() {
  if (!issue.value) return;
  try {
    const res = await api.post(`/api/issues/${issue.value.id}/unescalate/`, {});
    issue.value = { ...issue.value, ...res };
    emit("updated", issue.value);
    toast.success("Đã gỡ báo đỏ");
  } catch (e: any) {
    toast.error(e?.data?.detail || "Không gỡ được");
  }
}

const form = reactive({
  title: "",
  description: "",
  status: "",
  priority: "",
  assignee_id: null as number | null,
  parent_id: null as number | null,
  sprint_id: null as number | null,
  story_points: null as number | null,
  due_date: "",
  estimated_minutes: null as number | null,
});

const epicOptions = ref<{ id: number; issue_key: string; title: string }[]>([])

const sprints = computed(() => projectsStore.currentSprints)

const showEpicPicker = computed(() => {
  const t = issue.value?.issue_type
  return t === 'story' || t === 'task'
})

function resolveEpicParentId(issueData: any): number | null {
  if (!issueData || !['story', 'task'].includes(issueData.issue_type)) {
    return null
  }
  const parentId = issueData.parent
  if (!parentId) return null
  if (issueData.epic_key) return typeof parentId === 'object' ? parentId.id : parentId
  return null
}

async function loadEpicOptions(projectId: number) {
  try {
    const data = await api.get('/api/issues/', {
      project: projectId,
      issue_type: 'epic',
      page_size: 200,
      ordering: '-updated_at',
    })
    const list = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : [])
    epicOptions.value = list.map((e: any) => ({
      id: e.id,
      issue_key: e.issue_key,
      title: e.title,
    }))
  } catch {
    epicOptions.value = []
  }
}

async function loadIssue() {
  loading.value = true;
  try {
    issue.value = await issuesStore.fetchIssue(props.issueId);
    Object.assign(form, {
      title: issue.value.title,
      description: issue.value.description,
      status: issue.value.status,
      priority: issue.value.priority,
      assignee_id: issue.value.assignee?.id || null,
      parent_id: resolveEpicParentId(issue.value),
      sprint_id: issue.value.sprint || null,
      story_points: issue.value.story_points,
      due_date: issue.value.due_date || "",
      estimated_minutes: issue.value.estimated_minutes || null,
    });
    if (issue.value.project) {
      await loadEpicOptions(issue.value.project)
    }
    showMetaMobile.value = false
  } finally {
    loading.value = false;
  }
}

async function onEpicChange() {
  const parentId = form.parent_id || null
  await saveField('parent', parentId)
}

async function saveField(field: string, value: any) {
  if (isInvalidSprintDueDate(field, value)) {
    alert("Vui lòng nhập Hạn chót trước khi thêm vào Sprint!");
    return;
  }

  const updated = await issuesStore.updateIssue(props.issueId, {
    [field]: value,
  });
  issue.value = { ...issue.value, ...updated };
  emit("updated", issue.value);

  if (field === "due_date" && props.requireDueDate && value) {
    emit("close");
  }
}

async function saveTitle() {
  editingTitle.value = false;
  if (form.title !== issue.value.title) await saveField("title", form.title);
}

function cancelDescription() {
  form.description = issue.value?.description || ''
  editingDesc.value = false
}

async function saveDescription() {
  editingDesc.value = false
  const next = (form.description || '').trim()
  const prev = (issue.value?.description || '').trim()
  if (next !== prev) await saveField('description', form.description)
}

async function toggleSubtask(sub: any) {
  const newStatus = sub.status === "done" ? "todo" : "done";
  await issuesStore.updateIssue(sub.id, { status: newStatus });
  const idx = issue.value.subtasks.findIndex((s: any) => s.id === sub.id);
  if (idx !== -1) issue.value.subtasks[idx].status = newStatus;
}

async function createSubtask() {
  if (!newSubtaskTitle.value.trim()) return;
  const sub = await issuesStore.createIssue({
    project: issue.value.project,
    parent: issue.value.id,
    title: newSubtaskTitle.value,
    issue_type: "subtask",
    status: "todo",
    priority: "medium",
  });
  issue.value.subtasks.push(sub);
  newSubtaskTitle.value = "";
  addingSubtask.value = false;
}

function isInvalidSprintDueDate(nextField?: string, nextValue?: any) {
  const sprintId = nextField === "sprint" ? nextValue : form.sprint_id;

  const dueDate = nextField === "due_date" ? nextValue : form.due_date;

  return sprintId && !dueDate;
}

function onDueDateChange(e: any) {
  const value = e.target.value;

  if (form.sprint_id && !value) {
    toast.error("Không thể xóa hạn chót khi issue đang trong Sprint!");
    form.due_date = issue.value.due_date || "";
    return;
  }

  saveField("due_date", value || null);
}

const descFileInput = ref<HTMLInputElement>();
const descAttachments = ref<any[]>([]);
const descUploading = ref(false);
const descUploadingFiles = ref<{ name: string; progress: number }[]>([]);

async function loadDescAttachments() {
  const data = (await api.get("/api/attachments/", {
    issue: props.issueId,
  })) as any;
  descAttachments.value = data.results || data;
}

function handleDescFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  (e.target as HTMLInputElement).value = "";
  uploadDescFiles(files);
}

async function uploadDescFiles(files: File[]) {
  if (!files.length) return;
  descUploading.value = true;
  descUploadingFiles.value = files.map((f) => ({ name: f.name, progress: 0 }));
  for (let i = 0; i < files.length; i++) {
    const fd = new FormData();
    fd.append("file", files[i]);
    fd.append("issue", String(props.issueId));
    const timer = setInterval(() => {
      if (descUploadingFiles.value[i].progress < 90)
        descUploadingFiles.value[i].progress += 10;
    }, 100);
    try {
      const att = await api.post("/api/attachments/", fd);
      clearInterval(timer);
      descUploadingFiles.value[i].progress = 100;
      descAttachments.value.unshift(att);
    } catch {
      clearInterval(timer);
    }
  }
  setTimeout(() => {
    descUploading.value = false;
    descUploadingFiles.value = [];
  }, 500);
}

async function deleteDescAttachment(id: number) {
  if (!confirm("Xóa file này?")) return;
  await api.delete(`/api/attachments/${id}/`);
  descAttachments.value = descAttachments.value.filter((a) => a.id !== id);
}

function isDescImage(ct: string) {
  return ct?.startsWith("image/");
}

function formatDescSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function deleteIssue() {
  if (!confirm("Bạn có chắc muốn xóa issue này?")) return;
  await issuesStore.deleteIssue(props.issueId);
  emit("deleted", props.issueId);
}

// ===== Duplicate =====
const duplicatePrefill = computed(() => {
  if (!issue.value) return null;
  const src: any = issue.value;
  return {
    issue_type: src.issue_type || "task",
    title: `Bản sao — ${src.title || ""}`.slice(0, 200),
    description: src.description || "",
    priority: src.priority || "medium",
    story_points: src.story_points ?? null,
    estimated_minutes: src.estimated_minutes ?? null,
    assignee: src.assignee?.id ?? null,
    due_date: src.due_date || "",
  };
});

function onDuplicateCreated(newIssue: any) {
  duplicateOpen.value = false;
  try { toast.success(`Đã tạo bản sao ${newIssue?.issue_key || newIssue?.id || ''}`) } catch {}
  emit("updated", newIssue);
}

function formatDate(d: string) {
  return format(new Date(d), "dd/MM/yyyy HH:mm");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins}p`;
  return format(new Date(dateStr), "dd/MM HH:mm");
}

async function saveEstimated() {
  const val = form.estimated_minutes
  if (val !== null && (val < 1 || val > 120)) {
    form.estimated_minutes = Math.min(120, Math.max(1, val))
  }
  await saveField('estimated_minutes', form.estimated_minutes || null)
}

function formatEstimated(minutes: number) {
  if (minutes < 60) return `${minutes} phút`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`
}

// ===== Keyboard shortcuts =====
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const modKey = isMac ? '⌘' : 'Ctrl'

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function handleKeydown(e: KeyboardEvent) {
  if (loading.value || !issue.value) return

  // Ctrl/Cmd + Enter → save current inline edit
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (editingTitle.value) { e.preventDefault(); saveTitle(); return }
    if (editingDesc.value)  { e.preventDefault(); saveDescription(); return }
    return
  }

  // Esc → hủy chỉnh sửa inline, hoặc đóng modal
  if (e.key === 'Escape') {
    if (editingTitle.value) {
      e.preventDefault()
      form.title = issue.value.title
      editingTitle.value = false
      return
    }
    if (editingDesc.value) {
      e.preventDefault()
      cancelDescription()
      return
    }
    if (addingSubtask.value) {
      e.preventDefault()
      addingSubtask.value = false
      return
    }
    e.preventDefault()
    emit('close')
    return
  }

  // Letter shortcuts only when not typing
  if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return

  if (e.key === 'e' || e.key === 'E') {
    e.preventDefault()
    editingTitle.value = true
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault()
    editingDesc.value = true
  }
}

watch(() => props.issueId, () => {
  loadIssue()
})

onMounted(() => {
  loadIssue()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-slide-in-right { animation: slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-fade-in { animation: fade-in 0.2s ease-out; }
</style>
