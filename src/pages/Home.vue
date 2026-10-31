<template>
  <div class="home">
    <!-- 頭部 -->
    <div class="header">
      <h1>教育平台</h1>
      <div class="user-info">
        <span>{{ userEmail || '未登錄' }}</span>
      </div>
    </div>

    <!-- 課程列表 -->
    <div class="courses-container">
      <div v-if="loading" class="loading">
        <van-loading type="spinner" size="24px">載入中...</van-loading>
      </div>
      
      <div v-else-if="courses.length === 0" class="empty">
        <van-empty description="暫無課程" />
      </div>
      
      <div v-else class="courses-grid">
        <van-card
          v-for="course in courses"
          :key="course.id"
          :price="course.title"
          :desc="course.description || ''"
          :thumb="course.cover_url || '/default-cover.jpg'"
          class="course-card"
          @click="goToCourse(course.id)"
        >
          <template #title>
            <div class="course-title">{{ course.title }}</div>
          </template>
          <template #desc>
            <div class="course-description">{{ course.description || '暫無描述' }}</div>
          </template>
          <template #footer>
            <div class="course-footer">
              <van-tag type="success" v-if="getCourseProgress(course.id).isCompleted">
                已完成
              </van-tag>
              <van-tag type="primary" v-else-if="getCourseProgress(course.id).currentPage > 0">
                {{ getCourseProgress(course.id).currentPage }}/{{ getTotalLessons(course.id) }}
              </van-tag>
              <van-tag type="default" v-else>
                未開始
              </van-tag>
            </div>
          </template>
        </van-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { coursesAPI } from '../lib/supabase'
import { useLearningStore } from '../store/learning'

const router = useRouter()
const learningStore = useLearningStore()

const courses = ref([])
const loading = ref(true)
const userEmail = ref('')

// 獲取課程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    courses.value = await coursesAPI.getCourses()
  } catch (error) {
    console.error('獲取課程失敗:', error)
    showToast('獲取課程失敗')
  } finally {
    loading.value = false
  }
}

// 獲取總章節數
const getTotalLessons = (courseId: string) => {
  // 這裡可以從 store 中獲取，或者實現一個獲取章節數的 API
  // 暫時返回估計值
  return 10
}

// 獲取課程進度
const getCourseProgress = (courseId: string) => {
  return learningStore.getCourseProgress(courseId).value
}

// 跳轉到課程詳情
const goToCourse = (courseId: string) => {
  router.push(`/course/${courseId}`)
}

// 初始化
const init = async () => {
  // 這裡可以實現用戶登錄邏輯，暫時使用默認郵箱
  const defaultEmail = 'student@example.com'
  userEmail.value = defaultEmail
  
  await learningStore.getUserProgress(defaultEmail)
  await fetchCourses()
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.user-info {
  font-size: 14px;
  opacity: 0.9;
}

.courses-container {
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

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.course-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.course-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 20px;
  }
}
</style>