<template>
  <div class="course">
    <!-- 頭部導航 -->
    <div class="course-header">
      <van-nav-bar
        :title="course?.title || '課程詳情'"
        left-arrow
        @click-left="goBack"
      />
      <div class="progress-bar">
        <van-progress
          :percentage="progressPercentage"
          stroke-width="6"
          color="#667eea"
        />
        <span class="progress-text">{{ currentLessonIndex + 1 }}/{{ lessons.length }}</span>
      </div>
    </div>

    <!-- 課章節內容 -->
    <div class="course-content">
      <div v-if="loading" class="loading">
        <van-loading type="spinner" size="24px">載入中...</van-loading>
      </div>
      
      <div v-else-if="lessons.length === 0" class="empty">
        <van-empty description="暫無章節" />
      </div>
      
      <div v-else class="lessons-container">
        <!-- 章節內容渲染 -->
        <div v-for="lesson in lessons" :key="lesson.id">
          <div v-if="lesson.page_order === currentLessonIndex" class="lesson-content">
            <!-- 封面類型 -->
            <div v-if="lesson.type === 'cover'" class="lesson-cover">
              <h2>{{ lesson.content?.title }}</h2>
              <p class="subtitle">{{ lesson.content?.subtitle }}</p>
              <van-button 
                type="primary" 
                size="large" 
                round
                @click="nextLesson"
                class="start-button"
              >
                開始學習
              </van-button>
            </div>

            <!-- 文字類型 -->
            <div v-else-if="lesson.type === 'text'" class="lesson-text">
              <h2>{{ lesson.content?.title }}</h2>
              <div class="content-text" v-html="formatContent(lesson.content?.content)"></div>
              <div class="lesson-actions">
                <van-button 
                  v-if="currentLessonIndex > 0"
                  type="default"
                  size="large"
                  round
                  @click="prevLesson"
                >
                  上一頁
                </van-button>
                <van-button 
                  type="primary" 
                  size="large"
                  round
                  @click="nextLesson"
                  :disabled="!canGoNext"
                >
                  下一頁
                </van-button>
              </div>
            </div>

            <!-- 影片類型 -->
            <div v-else-if="lesson.type === 'video'" class="lesson-video">
              <h2>{{ lesson.content?.title }}</h2>
              <div class="video-container">
                <video
                  ref="videoRef"
                  :src="lesson.content?.video_url"
                  controls
                  @timeupdate="handleTimeUpdate"
                  @ended="handleVideoEnd"
                  @loadedmetadata="handleVideoLoaded"
                  class="video-player"
                ></video>
                <div class="video-progress-info">
                  <span>已看: {{ formatTime(watchedTime) }}</span>
                  <span>總長: {{ formatTime(videoDuration) }}</span>
                </div>
              </div>
              <div class="lesson-actions">
                <van-button 
                  v-if="currentLessonIndex > 0"
                  type="default"
                  size="large"
                  round
                  @click="prevLesson"
                >
                  上一頁
                </van-button>
                <van-button 
                  type="primary" 
                  size="large"
                  round
                  @click="nextLesson"
                  :disabled="!canGoNext"
                >
                  下一頁
                </van-button>
              </div>
            </div>

            <!-- 測驗類型 -->
            <div v-else-if="lesson.type === 'quiz'" class="lesson-quiz">
              <h2>{{ lesson.content?.title }}</h2>
              <div class="quiz-content">
                <h3 class="quiz-question">{{ lesson.content?.question }}</h3>
                <div class="quiz-options">
                  <van-radio-group v-model="selectedAnswer" @change="handleAnswerChange">
                    <van-radio 
                      v-for="(option, index) in lesson.content?.options" 
                      :key="index"
                      :name="index"
                      class="quiz-option"
                    >
                      {{ option }}
                    </van-radio>
                  </van-radio-group>
                </div>
                <div class="quiz-result" v-if="showResult">
                  <van-alert 
                    :type="isCorrect ? 'success' : 'warning'"
                    :description="resultMessage"
                  />
                  <van-button 
                    v-if="isCorrect"
                    type="primary" 
                    size="large"
                    round
                    @click="nextLesson"
                    class="next-button"
                  >
                    下一頁
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { coursesAPI, lessonsAPI } from '../lib/supabase'
import { useLearningStore } from '../store/learning'

const route = useRoute()
const router = useRouter()
const learningStore = useLearningStore()

const course = ref(null)
const lessons = ref([])
const loading = ref(true)
const currentLessonIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const isCorrect = ref(false)
const videoRef = ref(null)
const watchedTime = ref(0)
const videoDuration = ref(0)
const requiredWatchTime = ref(0) // 必須觀看的最短時間

// 計算進度百分比
const progressPercentage = computed(() => {
  if (lessons.value.length === 0) return 0
  return Math.round(((currentLessonIndex.value + 1) / lessons.value.length) * 100)
})

// 是否可以前往下一頁
const canGoNext = computed(() => {
  const currentLesson = lessons.value[currentLessonIndex.value]
  if (!currentLesson) return false
  
  if (currentLesson.type === 'quiz') {
    return showResult.value && isCorrect.value
  }
  
  if (currentLesson.type === 'video') {
    return watchedTime.value >= requiredWatchTime.value
  }
  
  return true
})

// 獲取課程詳情
const fetchCourseDetail = async () => {
  try {
    loading.value = true
    const courseId = route.params.id as string
    
    // 並行獲取課程和章節
    const [courseData, lessonsData] = await Promise.all([
      coursesAPI.getCourse(courseId),
      lessonsAPI.getLessons(courseId)
    ])
    
    course.value = courseData
    lessons.value = lessonsData
    
    // 獲取當前進度
    const progress = learningStore.getCourseProgress(courseId)
    currentLessonIndex.value = progress.currentPage
    
    // 如果章節為空，設置為0
    if (lessons.value.length > 0 && currentLessonIndex.value >= lessons.value.length) {
      currentLessonIndex.value = lessons.value.length - 1
    }
    
  } catch (error) {
    console.error('獲取課程詳情失敗:', error)
    showToast('獲取課程詳情失敗')
  } finally {
    loading.value = false
  }
}

// 格式化內容（簡單的markdown支持）
const formatContent = (content: string) => {
  if (!content) return ''
  
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// 格式化時間
const formatTime = (seconds: number) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 返回上一頁
const goBack = () => {
  router.back()
}

// 上一頁
const prevLesson = () => {
  if (currentLessonIndex.value > 0) {
    currentLessonIndex.value--
    resetLessonState()
  }
}

// 下一頁
const nextLesson = async () => {
  if (!canGoNext.value) return
  
  const courseId = route.params.id as string
  const newPageIndex = currentLessonIndex.value + 1
  
  // 更新進度
  await learningStore.updateProgress(
    courseId,
    newPageIndex,
    newPageIndex >= lessons.value.length
  )
  
  currentLessonIndex.value = newPageIndex
  resetLessonState()
  
  // 如果已經完成所有章節
  if (newPageIndex >= lessons.value.length) {
    showToast('恭喜完成課程！')
  }
}

// 重置章節狀態
const resetLessonState = () => {
  selectedAnswer.value = null
  showResult.value = false
  isCorrect.value = false
  watchedTime.value = 0
  requiredWatchTime.value = 0
}

// 處理答案選擇
const handleAnswerChange = (value: number) => {
  const currentLesson = lessons.value[currentLessonIndex.value]
  if (!currentLesson) return
  
  isCorrect.value = value === currentLesson.content?.correct_answer
  showResult.value = true
  
  if (!isCorrect.value) {
    showToast('答案錯誤，請重新選擇')
  }
}

// 處理影片時間更新
const handleTimeUpdate = () => {
  if (videoRef.value) {
    watchedTime.value = videoRef.value.currentTime
  }
}

// 處理影片結束
const handleVideoEnd = () => {
  watchedTime.value = videoDuration.value
}

// 處理影片元數據載入
const handleVideoLoaded = () => {
  if (videoRef.value) {
    videoDuration.value = videoRef.value.duration
    // 設置必須觀看的最短時間（影片的50%）
    requiredWatchTime.value = videoDuration.value * 0.5
  }
}

// 初始化
const init = async () => {
  await fetchCourseDetail()
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.course {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.course-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  padding: 12px 16px;
  background: white;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.course-content {
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.lessons-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lesson-content {
  padding: 20px;
}

/* 封面樣式 */
.lesson-cover {
  text-align: center;
  padding: 40px 20px;
}

.lesson-cover h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.start-button {
  min-width: 200px;
}

/* 文字樣式 */
.lesson-text h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 32px;
}

.content-text p {
  margin-bottom: 16px;
}

.content-text strong {
  color: #333;
}

.content-text em {
  color: #666;
}

/* 影片樣式 */
.lesson-video h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.video-container {
  position: relative;
  margin-bottom: 16px;
}

.video-player {
  width: 100%;
  height: 200px;
  background: #000;
  border-radius: 8px;
}

.video-progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

/* 測驗樣式 */
.lesson-quiz h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.quiz-question {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.quiz-options {
  margin-bottom: 20px;
}

.quiz-option {
  margin-bottom: 12px;
}

.quiz-result {
  margin-top: 20px;
}

.next-button {
  width: 100%;
}

/* 按鈕樣式 */
.lesson-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.lesson-actions .van-button {
  flex: 1;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .lesson-content {
    padding: 16px;
  }
  
  .lesson-cover h2 {
    font-size: 20px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .video-player {
    height: 150px;
  }
}
</style>