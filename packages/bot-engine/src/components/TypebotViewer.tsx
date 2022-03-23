/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { CSSProperties, useMemo } from 'react'
import { TypebotContext } from '../contexts/TypebotContext'
import Frame from 'react-frame-component'
//@ts-ignore
import styles from '../assets/style.css'
//@ts-ignore
import phoneNumberInputStyle from 'react-phone-number-input/style.css'
//@ts-ignore
import importantStyles from '../assets/importantStyles.css'
//@ts-ignore
import phoneSyle from '../assets/phone.css'
import { ConversationContainer } from './ConversationContainer'
import { AnswersContext } from '../contexts/AnswersContext'
import {
  Answer,
  BackgroundType,
  Edge,
  PublicTypebot,
  VariableWithValue,
} from 'models'
import { Log } from 'db'

export type TypebotViewerProps = {
  typebot: PublicTypebot
  isPreview?: boolean
  apiHost?: string
  style?: CSSProperties
  predefinedVariables?: { [key: string]: string | undefined }
  onNewBlockVisible?: (edge: Edge) => void
  onNewAnswer?: (answer: Answer) => void
  onNewLog?: (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) => void
  onCompleted?: () => void
  onVariablesPrefilled?: (prefilledVariables: VariableWithValue[]) => void
}

export const TypebotViewer = ({
  typebot,
  apiHost = process.env.NEXT_PUBLIC_VIEWER_URL?.split(',')[0],
  isPreview = false,
  style,
  predefinedVariables,
  onNewLog,
  onNewBlockVisible,
  onNewAnswer,
  onCompleted,
  onVariablesPrefilled,
}: TypebotViewerProps) => {
  const containerBgColor = useMemo(
    () =>
      typebot?.theme?.general?.background?.type === BackgroundType.COLOR
        ? typebot.theme.general.background.content
        : 'transparent',
    [typebot?.theme?.general?.background]
  )
  const handleNewBlockVisible = (edge: Edge) =>
    onNewBlockVisible && onNewBlockVisible(edge)

  const handleNewAnswer = (answer: Answer) => onNewAnswer && onNewAnswer(answer)

  const handleNewLog = (log: Omit<Log, 'id' | 'createdAt' | 'resultId'>) =>
    onNewLog && onNewLog(log)

  const handleCompleted = () => onCompleted && onCompleted()

  if (!apiHost)
    return <p>process.env.NEXT_PUBLIC_VIEWER_URL is missing in env</p>
  return (
    <Frame
      id="typebot-iframe"
      head={
        <style>
          {phoneNumberInputStyle}
          {phoneSyle}
          {styles}
          {typebot.theme?.customCss}
          {importantStyles}
        </style>
      }
      name="Typebot viewer"
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=${
            typebot?.theme?.general?.font ?? 'Open Sans'
          }:wght@300;400;600&display=swap');`,
        }}
      />
      <TypebotContext
        typebot={typebot}
        apiHost={apiHost}
        isPreview={isPreview}
        onNewLog={handleNewLog}
      >
        <AnswersContext onNewAnswer={handleNewAnswer}>
          <div
            className="flex text-base overflow-hidden bg-cover h-screen w-screen flex-col items-center typebot-container"
            style={{
              // We set this as inline style to avoid color flash for SSR
              backgroundColor: containerBgColor ?? 'transparent',
            }}
            data-testid="container"
          >
            <div className="flex w-full h-full justify-center">
              <ConversationContainer
                theme={typebot.theme}
                onNewBlockVisible={handleNewBlockVisible}
                onCompleted={handleCompleted}
                predefinedVariables={predefinedVariables}
                onVariablesPrefilled={onVariablesPrefilled}
              />
            </div>
            {typebot.settings.general.isBrandingEnabled && (
              <a
                href={'https://www.typebot.io/?utm_source=litebadge'}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed py-1 px-2 bg-white z-50 rounded shadow-md lite-badge"
                style={{ bottom: '20px' }}
              >
                Made with <span className="text-blue-500">Typebot</span>.
              </a>
            )}
          </div>
        </AnswersContext>
      </TypebotContext>
    </Frame>
  )
}
