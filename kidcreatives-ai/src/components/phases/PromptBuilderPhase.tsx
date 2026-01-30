import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sparky } from '@/components/ui/Sparky'
import { PromptEngine } from '@/components/ui/PromptEngine'
import { useGeminiText } from '@/hooks/useGeminiText'
import { usePromptState } from '@/hooks/usePromptState'
import { useConfetti } from '@/hooks/useConfetti'
import { selectVariables, getColorCategory } from '@/lib/promptQuestions'
import type { PromptVariable } from '@/types/PromptState'

const MAX_ANSWER_LENGTH = 100

interface PromptBuilderPhaseProps {
  originalImage: string
  intentStatement: string
  visionAnalysis: string
  onBack: () => void
  onNext: (promptStateJSON: string) => void
}

export function PromptBuilderPhase({
  originalImage,
  intentStatement,
  visionAnalysis,
  onBack,
  onNext
}: PromptBuilderPhaseProps) {
  const [variables, setVariables] = useState<PromptVariable[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const { celebratePhaseCompletion } = useConfetti()
  const [sparkyMessage, setSparkyMessage] = useState('')
  
  const { question, isGenerating, generateQuestion } = useGeminiText()
  const { promptState, addAnswer, isComplete, progress } = usePromptState(
    originalImage,
    intentStatement,
    visionAnalysis,
    4
  )

  useEffect(() => {
    const selectedVariables = selectVariables(4)
    setVariables(selectedVariables)
    setSparkyMessage("Let's build your AI prompt together! Answer a few fun questions about your creation.")
  }, [])

  useEffect(() => {
    if (variables.length > 0 && promptState.currentQuestionIndex === 0 && !question) {
      const firstVariable = variables[0]
      const colorCategory = getColorCategory(firstVariable)
      
      generateQuestion(
        intentStatement,
        visionAnalysis,
        firstVariable,
        colorCategory
      )
    }
  }, [variables, promptState.currentQuestionIndex, question, intentStatement, visionAnalysis, generateQuestion])

  // Generate next question when currentQuestionIndex changes (after answer is added)
  useEffect(() => {
    const currentIndex = promptState.currentQuestionIndex
    
    // Skip if we're on the first question (handled by initial useEffect above)
    if (currentIndex === 0) return
    
    // Skip if we've completed all questions
    if (currentIndex >= variables.length) {
      setSparkyMessage("Awesome! You've built a complete AI prompt! Ready to see your creation come to life?")
      return
    }
    
    // Generate next question
    const nextVariable = variables[currentIndex]
    const colorCategory = getColorCategory(nextVariable)
    
    generateQuestion(
      intentStatement,
      visionAnalysis,
      nextVariable,
      colorCategory
    )
  }, [promptState.currentQuestionIndex, variables, intentStatement, visionAnalysis, generateQuestion, setSparkyMessage])

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_ANSWER_LENGTH) {
      setCurrentAnswer(value)
    }
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || !question) return

    addAnswer(
      question.variable,
      question.question,
      currentAnswer.trim(),
      question.colorCategory
    )

    setCurrentAnswer('')
    setSparkyMessage("Great answer! Let's keep going...")
  }

  const handleNext = () => {
    celebratePhaseCompletion()
    onNext(JSON.stringify(promptState))
  }

  const canSubmit = currentAnswer.trim().length > 0 && !isGenerating

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Build Your AI Prompt
          </h1>
          <p className="text-lg text-gray-600">
            Answer questions to teach the AI about your creation
          </p>
          
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {promptState.currentQuestionIndex + 1} of {promptState.totalQuestions}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-subject-blue h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <Sparky
              state={isGenerating ? 'thinking' : isComplete ? 'success' : 'waiting'}
              message={sparkyMessage}
            />

            {question && !isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/20"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {question.question}
                </h2>

                <div className="space-y-4">
                  <div>
                    <textarea
                      value={currentAnswer}
                      onChange={handleAnswerChange}
                      placeholder="Type your answer here..."
                      disabled={isGenerating}
                      className={`w-full h-32 p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-subject-blue transition-colors ${
                        isGenerating
                          ? 'bg-gray-100 border-gray-300'
                          : 'bg-white border-gray-300 hover:border-subject-blue'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {currentAnswer.length}/{MAX_ANSWER_LENGTH}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!canSubmit}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? (
                      'Thinking...'
                    ) : (
                      <>
                        Submit Answer <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md rounded-lg p-6 shadow-xl border border-white/20 text-center"
              >
                <h2 className="text-2xl font-bold text-action-green mb-4">
                  🎉 Prompt Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  You've created {promptState.variables.length} AI instructions. Ready to generate your masterpiece?
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={onBack}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="default"
                    size="lg"
                    className="flex-1"
                  >
                    Generate Image <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PromptEngine variables={promptState.variables} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
