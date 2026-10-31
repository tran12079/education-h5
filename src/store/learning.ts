import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { progressAPI } from '../lib/supabase'

interface CourseProgress {
  courseId: string
  currentPage: number
  isCompleted: boolean
}

export const useLearningStore = defineStore('learning', () => {
  const userEmail = ref('')
  const coursesProgress = ref<Record<string, CourseProgress>>({})

  // 獲取當前用戶的學習進度
  const getUserProgress = async (email: string) => {
    userEmail.value = email
    // 獲取該用戶所有課程的進度
    const { data: courses } = await import('../lib/supabase').then(m => m.coursesAPI.getCourses())
    
    for (const course of courses) {
      const progress = await progressAPI.getProgress(email, course.id)
      if (progress) {
        coursesProgress.value[course.id] = {
          courseId: course.id,
          currentPage: progress.current_page,
          isCompleted: progress.is_completed
        }
      } else {
        // 如果沒有進度記錄，創建一個新的
        await progressAPI.createProgress(email, course.id)
        coursesProgress.value[course.id] = {
          courseId: course.id,
          currentPage: 0,
          isCompleted: false
        }
      }
    }
  }

  // 更新學習進度
  const updateProgress = async (courseId: string, currentPage: number, isCompleted: boolean = false) => {
    if (!userEmail.value) {
      throw new Error('用戶未登錄')
    }

    await progressAPI.updateProgress(userEmail.value, courseId, currentPage, isCompleted)
    
    coursesProgress.value[courseId] = {
      courseId,
      currentPage,
      isCompleted
    }
  }

  // 獲取特定課程的進度
  const getCourseProgress = (courseId: string) => {
    return computed(() => coursesProgress.value[courseId] || {
      courseId,
      currentPage: 0,
      isCompleted: false
    })
  }

  return {
    userEmail,
    coursesProgress,
    getUserProgress,
    updateProgress,
    getCourseProgress
  }
})