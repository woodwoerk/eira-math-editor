import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { AddIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

import UploadIcon from './UploadIcon'
import t from '../i18n'
import AnswerCard from './AnswerCard'
import FileUploadModal from './FileUploadModal'
import ConfirmDelete from './ConfirmDelete'
import { combineAndDownloadPdf } from '../utils/download'

const MOTION = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
}

const Sidebar = ({ answers, onAddAnswer, onDeleteAnswer, onClickAnswer }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([])

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure()

  const handleFileSubmit = (fileContent) => {
    onAddAnswer(fileContent)
    closeModal()
  }

  const handleCheckAnswer = (answerId, isChecked) => {
    setSelectedAnswers(
      isChecked
        ? [...new Set([...selectedAnswers, answerId])]
        : selectedAnswers.filter((id) => id !== answerId)
    )
  }

  const handleDeleteAnswer = (answerId) => {
    handleCheckAnswer(answerId, false)
    onDeleteAnswer(answerId)
  }

  const handleCheckAll = (isChecked) => {
    setSelectedAnswers(isChecked ? answers.map(({ id }) => id) : [])
  }

  const handleDownloadSelected = () => {
    combineAndDownloadPdf(
      answers.filter((answer) => selectedAnswers.includes(answer.id))
    )
  }

  const handleDeleteSelected = () => {
    selectedAnswers.forEach(onDeleteAnswer)
    setSelectedAnswers([])
  }

  const allAnswersChecked = selectedAnswers.length === answers.length
  const someAnswersChecked = selectedAnswers.length > 0 && !allAnswersChecked

  return (
    <>
      <AnimatePresence initial={false}>
        <Box mb={2}>
          {!someAnswersChecked && !allAnswersChecked ? (
            <Stack
              key="global-actions"
              as={motion.div}
              direction="row"
              spacing={2}
              {...MOTION}
            >
              <Button leftIcon={<AddIcon />} onClick={onAddAnswer}>
                {t('NEW_ANSWER')}
              </Button>
              <Button leftIcon={<UploadIcon />} onClick={openModal}>
                {t('OPEN_FILE')}
              </Button>
            </Stack>
          ) : (
            <Stack
              key="selected-actions"
              as={motion.div}
              direction="row"
              spacing={2}
              pl={3}
              {...MOTION}
            >
              <Checkbox
                onChange={(e) => handleCheckAll(e.target.checked)}
                isChecked={allAnswersChecked}
                isIndeterminate={someAnswersChecked}
              />
              <Button
                borderRadius={20}
                leftIcon={<DownloadIcon />}
                onClick={handleDownloadSelected}
              >
                {t('PDF')}
              </Button>
              <div>
                <ConfirmDelete
                  onConfirmDelete={handleDeleteSelected}
                  confirmMessage={t('CONFIRM_DELETE_SELECTED')}
                >
                  <IconButton
                    isRound
                    icon={<DeleteIcon />}
                    aria-label={t('DELETE_SELECTED')}
                  />
                </ConfirmDelete>
              </div>
            </Stack>
          )}
        </Box>
      </AnimatePresence>

      <Stack
        as="ul"
        spacing={2}
        flex="1"
        minHeight="0"
        overflowX="hidden"
        overflowY="auto"
      >
        <AnimatePresence initial={false}>
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              onDelete={() => handleDeleteAnswer(answer)}
              onClick={() => onClickAnswer(answer)}
              onCheck={(isSelected) => handleCheckAnswer(answer.id, isSelected)}
              isSelected={selectedAnswers.includes(answer.id)}
            />
          ))}
        </AnimatePresence>
      </Stack>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFileSubmit}
      />
    </>
  )
}

Sidebar.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onAddAnswer: PropTypes.func.isRequired,
  onDeleteAnswer: PropTypes.func.isRequired,
  onClickAnswer: PropTypes.func.isRequired,
}

export default Sidebar
