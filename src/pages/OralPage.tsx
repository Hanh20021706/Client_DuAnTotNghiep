import React, { useContext, useEffect } from 'react'
import '../css/oral.css'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import NavOral from '../components/NavOral'
import HeaderOral from '../HeaderOral'
import { useParams } from 'react-router-dom'
import { listSentencesByIdActivity, listSentencesByIdDay } from '../api/sentence'
import { SentenceType } from '../types/sentence'
import { useSpeechSynthesis } from 'react-speech-kit';
import { SpeechContext } from '../context/GoogleSpeechContext'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import GoogleSpeechOral from '../components/GoogleSpeech/GoogleSpeechOral'
import { changeSpeechValue } from '../features/Slide/googleSpeech/GoogleSpeechSlice'

import { XOutline, CheckOutline } from "heroicons-react"
import { detailDay } from '../api/day'
import { DayType } from '../types/day'

const month = [
    { id: 1, name: 'thi cau ngay' },
    { id: 2, name: 'thi cau tuan' },
    { id: 3, name: 'thi cau thang' },
    { id: 3, name: 'thi cau quy' },
]
const day = [
    { id: 1, name: 'ngay 1' },
    { id: 2, name: 'ngay 2' },
    { id: 3, name: 'ngay 3' },
    { id: 3, name: 'ngay 4' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}
const OralPage = () => {

    const transcript = useAppSelector(item => item.googleSpeech.transcript)
    const dispatch = useAppDispatch()
    const { cancel, speak, speaking, supported, voices, pause, resume } = useSpeechSynthesis();
    const { dayId, id } = useParams();
    const [day, setDay] = useState<DayType>()
    const [sentencesIndex, setSentencesIndex] = useState<number>(0)
    const [history, setHistory] = useState<any>([])
    const [dataSentences, setDataSentSentences] = useState<SentenceType[]>([])
    const [sentencesSplit, setSentencesSplit] = useState<string[]>([])
    const transcriptSplit = transcript.split(" ")

    const onContinute = () => {
        const exitsHistory = history.find(item => item.id === sentencesIndex)
        if (exitsHistory) {
            setHistory(history.map((item: any) => item.id === sentencesIndex ? { ...item, value: transcript } : item))
        } else {
            setHistory([...history, { id: sentencesIndex, value: transcript }])
        }
        if (sentencesIndex >= dataSentences.length - 1) {
            setSentencesIndex(0)
            setSentencesSplit(dataSentences[0].words.split(" "))
        } else {
            setSentencesIndex(sentencesIndex + 1)
            setSentencesSplit(dataSentences[sentencesIndex + 1].words.split(" "))
        }
        dispatch(changeSpeechValue(""))
    }

    useEffect(() => {
        const getSentences = async () => {
            const { data } = await listSentencesByIdDay(String(dayId))
            const { data: dataDay } = await detailDay(String(dayId))
            setDataSentSentences(data)
            setDay(dataDay)
            setSentencesSplit(data[sentencesIndex].words.split(" "))
        }
        getSentences()
    }, [dayId])

    return (
        <div className='oralPage'>
            <div className="main__oral__page">
                <HeaderOral />

                <div className="exam__content__wrap__oral">
                    <div className="exam__container__oral">
                        <table className='table__exam__oral'>
                            <thead  >
                                <tr className='row__table__exem__oral' >
                                    <th className='w-24'>
                                        <div className="flex flex-col  justify-center items-center">
                                            <span>Đề</span>
                                            <button onClick={() => speak({ text: dataSentences && dataSentences[sentencesIndex]?.words, voice: voices[2] })}>
                                                <i className="fa-solid fa-volume-high"></i>
                                            </button>
                                        </div>
                                    </th>
                                    <td>
                                        <div className='title__exam__oral__table'>
                                            <div className="flex gap-1">
                                                {dataSentences.length !== 0
                                                    ? dataSentences[sentencesIndex]?.words.split(" ")?.map((item: string, index: number) => {
                                                        return <button className='' onClick={() => speak({ text: item, voice: voices[2] })}>
                                                            <span className='text-xl font-semibold hover:text-[#8EC300]'>{item}</span>
                                                        </button>
                                                    })
                                                    : ""}
                                            </div>

                                        </div>
                                        <div className='result__exam__oral'>
                                            <p>
                                                {dataSentences.length !== 0 ? dataSentences[sentencesIndex]?.meaning : ""}
                                            </p>
                                        </div>

                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='row__body__table__oral '>
                                    <th className='w-24'>
                                        Thu âm
                                        <GoogleSpeechOral />
                                    </th>
                                    <td className={`${transcript !== "" ? "flex" : "hidden"} m-0 pr-6 justify-between items-center`}>
                                        <div className={`flex  gap-1`}>
                                            <div className="flex gap-1">
                                                {transcriptSplit.map((item: string, index: number) => {
                                                    if (item.toLowerCase().trim() === sentencesSplit[index]?.toLowerCase().trim()) {
                                                        return <span className="text-green-500">
                                                            {sentencesSplit[index]}
                                                        </span>
                                                    } else {
                                                        return <span className="text-red-500">
                                                            {item}
                                                        </span>
                                                    }
                                                })}
                                            </div>
                                            <div className="flex gap-1">
                                                {transcriptSplit.length < sentencesSplit.length ? sentencesSplit.map((item: string, index: number) => {
                                                    if (index >= transcriptSplit.length) {
                                                        return <span className="text-gray-400">
                                                            {item}
                                                        </span>
                                                    }
                                                }) : ""}
                                            </div>
                                        </div>
                                        <div className="">
                                            {transcript !== ""
                                                ? transcript.toLowerCase().trim().replace(".", "") === dataSentences[sentencesIndex]?.words.toLowerCase().trim().replace(".", "")
                                                    ? <CheckOutline className='text-green-500' />
                                                    : <XOutline className='text-red-500' />
                                                : ""
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="btn__control__exam">
                            <div>
                                <button className='btn__next__control' onClick={onContinute} >
                                    Câu tiếp theo
                                </button>
                            </div>
                            <div>
                                <p>
                                    câu số 1 / <span>
                                        {dataSentences.length}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="list__answered">
                    <div className='title__list__answered'>
                        <p>
                            Danh sách ôn tập
                        </p>
                    </div>
                    <ol className='list__answered__result'>
                        {dataSentences.map((item: SentenceType, index: number) => {
                            const flag2 = item?.words.split(" ")
                            return <li>
                                <div className="question__list__result">
                                    <p>
                                        <i className="fa-solid fa-volume-high"></i>  {item.words}
                                    </p>
                                </div>
                                <div className='transe__answered__list'>
                                    <p>
                                        {item.meaning}
                                    </p>
                                </div>
                                <div className="transe__answered__list flex justify-between">
                                    <div className=' result__list__user flex gap-1'>
                                        {history.length !== 0 && history[index] !== undefined
                                            ? history[index]?.value?.split(" ").map((item2: string, index: number) => {
                                                if (item2.toLowerCase().trim().replace(".", "") === flag2[index].toLowerCase().trim().replace(".", "")) {
                                                    return <span className="text-green-500">
                                                        {flag2[index]}
                                                    </span>
                                                } else {
                                                    return <span className="text-red-500">
                                                        {item2}
                                                    </span>
                                                }
                                            })
                                            : ""}
                                    </div>
                                    <div className="">
                                        {history.length !== 0 && history[index] !== undefined
                                            ? history[index]?.value?.replace(".", "").toLowerCase().trim() === item.words.replace(".", "").toLowerCase().trim()
                                                ? <CheckOutline className='text-green-500' />
                                                : <XOutline className='text-red-500' />
                                            : ""
                                        }
                                    </div>
                                </div>
                            </li>
                        })}

                    </ol>
                </div>

            </div>
            <NavOral />
        </div>
    )
}

export default OralPage