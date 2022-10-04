/* eslint-disable jsx-a11y/alt-text */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useSpeechSynthesis } from 'react-speech-kit';
import { Progress, Button, Modal, Collapse } from 'antd';
import Countdown, { CountdownApi } from 'react-countdown';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getListQuizSlide } from '../features/Slide/quiz/QuizSlide';
import { getListAnswerQuizSlide } from '../features/Slide/answerQuiz/AnswerQuizSlide';
import { detailCategory } from '../api/category';
import { useParams, NavLink } from 'react-router-dom';
import { detailQuiz } from '../api/quiz';
import reactStringReplace from 'react-string-replace'
import { motion, AnimatePresence } from "framer-motion"
import { DebounceInput } from 'react-debounce-input';
// import './../css/quiz.css'

import moment from 'moment';

import { addUserQuiz } from '../api/userQuiz';
import { addHistory, detailHistory } from '../api/history';
import { HistoryType } from '../types/history';

import NavDeatil from '../components/NavDeatil';
import TimeLimitCountdown from '../components/TimeLimitCountdown';
import { changeTime } from '../features/Slide/timeLimitCountdown/timeLimitCountdown';
import TimeCountDown from '../components/TimeCountDown';
import Menu from '../components/Menu';


let flag1: string = ""
let flag2: number = 0

const CountdownWrapper = ({ time, reset }) => {
    const ref = useRef<any>();
    const Completionist = () => <span>You are good to go!</span>;
    let timeLimit = 100
    let point = 1000
    let countdownApi: CountdownApi | null = null;
    const [state, setState] = useState<any>()
    let minutesUser = 0
    let secondsUser = 0

    //---TimeLimitCountdown---
    //Đếm ngược thời gian làm 
    const renderer = ({ total, hours, minutes, seconds, milliseconds, completed, api }) => {

        if (completed) {
            return <Completionist />;
        } else {
            api.start()
            let tempTime = moment.duration(time);

            if (tempTime.minutes() === 0) {
                const total = (1 / tempTime.seconds()) * 100
                const total2 = (1 / tempTime.seconds()) * 1000
                point = point - total2
                flag2 = point
                timeLimit = timeLimit - total
            } else {
                const total = (1 / (tempTime.minutes() * 60) + tempTime.seconds()) * 100
                const total2 = (1 / (tempTime.minutes() * 60) + tempTime.seconds()) * 1000
                point = point - total2
                flag2 = point
                timeLimit = timeLimit - total
            }
            if (flag2 < 0) {
                flag2 = 0
            }

            secondsUser = secondsUser + 1
            if(secondsUser === 60){
                minutesUser = minutesUser + 1
                secondsUser = 0 
            }
            flag1 = `${minutesUser}:${secondsUser}`

            if (timeLimit === 0) {
                timeLimit = 100;
            }
           
            return <div className="">
                <Progress
                    strokeColor={{
                        from: '#108ee9',
                        to: '#87d068',
                    }}
                    percent={timeLimit}
                    status="active"
                    className="!mt-[3px] !h-4 !text-white "
                    showInfo={false}
                />
            </div>
        }
    };

    useEffect(() => {
        setState(Date.now() + time)
    }, [time, reset])

    return <Countdown
        date={state}
        key={state}
        renderer={renderer}
    />
};

const MemoCountdown = React.memo(CountdownWrapper);

const QuizPage = () => {

    const answerQuizs = useAppSelector(item => item.answerQuiz.value)
    const dispatch = useAppDispatch()
    const [select, setSelect] = useState<any>(null)
    const [check, setCheck] = useState(false)
    const [check2, setCheck2] = useState<any>()
    const [done, setDone] = useState<any>()
    const timeSlice = useAppSelector(item => item.time.value)

    const audioCorrect = new Audio("../public/assets/audio/Quiz-correct-sound-with-applause.mp3")
    const audioWrong = new Audio("../public/assets/audio/Fail-sound-effect-2.mp3")

    // const audioCorrect = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3")
    // const audioWrong = new Audio("../assets/audio/Fail-sound-effect-2.mp3")
    const { cancel, speak, speaking, supported, voices, pause, resume } = useSpeechSynthesis();

    const [quiz2, setQuiz2] = useState<any>([])
    const [quizList, setQuizList] = useState<any>()
    const [percent, setPercent] = useState<number>(0);
    let input2: any = []
    let check10: any = []
    const [quizIndex, setQuizIndex] = useState<number>(0)
    const { id }: any = useParams()
    const ref = useRef(null)
    const [result, setResult] = useState<any[]>([])
    const [onReset, setOnReset] = useState<boolean>(false)
    const { Panel } = Collapse;

    // kiểm tra đúng sai ghép câu
    const [quizCompound, setQuizCompound] = useState<any>([])
    let checkFlag = 0
    let answerType3 = 0
    if (quizList) {
        const flag = quizCompound?.map(u => u.answer).join(' ')
        const checkFlag2 = quizList[quizIndex].quiz.question.toLowerCase().replace("?", "").trim() === flag.toLowerCase() ? 1 : 0
        checkFlag = checkFlag2
        answerType3 = flag

    }

    //---Countinute---
    // Chuyển câu hỏi
    const onContinute = () => {
        setSelect(null)
        input2 = []
        check10 = []
        setCheck2(null)
        setCheck(false)
        setOnReset(!onReset)
        setQuizCompound([])
        checkFlag = 0
        answerType3 = 0
        if (quizIndex >= quizList.length - 1) {
            setDone(true)
        } else {
            setQuizIndex(quizIndex + 1)
        }
    }

    //---Finish---
    // Kết thúc làm bài và đẩy đáp án đã chọn lên server
    const onFinish = async () => {
        let totalPoint = 0
        let totalCorrect = 0
        const quizListHalf = quizList.length / 2
        let pass = 0
        result.forEach((item: any, index: number) => {
            totalPoint = totalPoint + item.point
            if (item.isCorrect === 1) {
                totalCorrect = totalCorrect + 1
            }
            if (totalCorrect > quizListHalf) {
                pass = 1
            }
        })

        const { data: data2 } = await addHistory({
            user: "62c853c16948a16fbde3b43e",
            category: quiz2.category._id,
            totalPoint: totalPoint,
            totalCorrect: totalCorrect,
            result: pass,
            type: 2
        })
        for (let index = 0; index < result.length; index++) {
            const flag = { ...result[index], history: data2._id }
            console.log("flag", flag);
            const { data } = await addUserQuiz(flag)
        }

        const { data } = await detailCategory(id)
        console.log(data);
        setQuiz2(data)

        const test2 = await Promise.all(data?.history.map(async (item: HistoryType, index) => {
            const { data } = await detailHistory(item._id)
            // const { data: data2 } = await detailQuiz(item._id)

            // console.log("correctAnswer data2", data2);
            // const correctAnswer = quizList?.map((item: any, index: number) => {
            //     return item.answerQuiz.filter((item2: any, index: number) => {
            //         if (item2.isCorrect === 1) {
            //             return item2

            //         }
            //     })
            // })
            // console.log("correctAnswer", correctAnswer);
            return data
        }))
        setHistory(test2)

        setIsModalOpen(true);



    }



    const [checkInputLength, setCheckInputLength] = useState<any>([])

    //---ChangeInput---
    // Gán kết quả khi thay đổi giá trị trong input
    const onChangeInput = (e, index) => {
        const val = e.target.value.toLowerCase()
        const existingItem = input2.find((item: any) => item.key === index);
        if (!existingItem) {
            input2 = [...input2, { key: index, value: val }]
            check10 = [...check10, { key: index, check: false }]
        } else {
            input2 = input2.map((item: any) => item.key === index ? { key: index, value: val } : item)
        }
        checkInput(index)
        setCheckInputLength(input2)
    }

    //---CheckInputResult---
    // Kiểm tra kết quả input 
    const checkInput = (flag) => {
        input2.map((item2: any) => {
            quizList[quizIndex]?.answerQuiz.map((item: any, index) => {
                if (index === flag) {
                    if (item.answer.toLowerCase() === item2.value) {
                        check10 = check10.map((item: any) => item.key === flag ? { key: flag, check: true } : item)
                    } else {
                        check10 = check10.map((item: any) => item.key === flag ? { key: flag, check: false } : item)
                    }
                }
            })
        })
        if (input2.length === quizList[quizIndex].answerQuiz.length) {
            let test = check10.every(item => item.check === true)
            if (test === true) {
                setCheck2(true)
            } else {
                setCheck2(false)
            }
        } else {
            setCheck2(false)
        }
    }


    //---QuizProgress---
    //Tiến trình làm bài Quiz
    const increase = () => {
        let newPercent = percent + (100 / quizList.length);
        if (newPercent > 100) {
            newPercent = 100;
        }
        setPercent(newPercent);
    };

    //---ModalResult---
    function shuffleArray(array) {
        let i = array.length - 1;
        for (; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    //---ReplaceStringInput quiz listen and write ---
    //thay các chuỗi string trong câu hỏi thành input
    const replaceString = (e, b) => {
        let str = e
        b.map((item: any, index) => {
            str = reactStringReplace(str, item.answer, (match, i) => {
                return <input key={index} id={`input${index + 1}`} className={`${item.answer.length <= 5 ? "w-24" : "w-48 "}  border-b-2 border-black focus:outline-none focus:border-[#130ff8]`} type="text" name={`input${index + 1}`}
                    onChange={(e) => {
                        setTimeout(() => {
                            onChangeInput(e, index)
                        }, 300)
                    }}
                />
            });
        })

        return str

    }

    //---ModalResult---
    //Hiện Modal kết quả
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [history, setHistory] = useState<any>([]);

    const showModal = async () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };


    //---ModelCollapse---
    const onChange = (key: string | string[]) => {
    };



    useEffect(() => {
        dispatch(getListQuizSlide())
        dispatch(getListAnswerQuizSlide())
        const getQuiz = async () => {
            const { data } = await detailCategory(id)
            setQuiz2(data)
            const test = await Promise.all(data?.quizs.map(async (item: any, index) => {
                const { data } = await detailQuiz(item._id)
                return data
            }))
            setQuizList(shuffleArray(test))
            const test2 = await Promise.all(data?.history.map(async (item: HistoryType, index) => {
                const { data } = await detailHistory(item._id)
                return data
            }))
            setHistory(test2)
        }
        getQuiz()
    }, [id])


    return (
        <>
            <div className='m-auto grid grid-cols-12 gap-8 mt-[70px]'>

                <div className='col-span-2'>
                    <NavDeatil />
                </div>

                <div className='col-span-7 main__topic'>
                    <div className='item__quiz__topic'>
                        <div className="desc__title__cocabulary">

                            <Progress
                                strokeColor={{
                                    from: '#108ee9',
                                    to: '#87d068',
                                }}
                                percent={percent}
                                status="active"
                                className="!mt-[3px] !h-4 !text-white "
                                showInfo={false}
                            />

                            <MemoCountdown time={quizList ? quizList[quizIndex].quiz.timeLimit : 40000} reset={onReset} />

                            <h2>
                                Câu hỏi thông dụng <span>
                                    /   {quiz2?.category?.title}
                                </span>
                            </h2>

                            <div className='count__question__vocabulary'>
                                <h4 >
                                    Câu số <span>{quizIndex + 1}</span> / <span>{quizList?.length}</span>
                                </h4>
                            </div>
                        </div>

                        <div className="box__question__quiz">
                            <div className="box__header__topic">
                                <button
                                    className='btn__volume__vocabulary'
                                    onClick={() => speak({ text: quizList[quizIndex]?.quiz?.question, voice: voices[2] })}
                                >
                                    <i className="fa-solid fa-volume-high"></i>
                                </button>

                                <h3 className="vocabulary__speaking">
                                    {quizList ? quizList[quizIndex]?.quiz?.question : ""} ?
                                </h3>

                            </div>

                        </div>

                        <div className="items-center">
                            {quizList ?
                                quizList[quizIndex]?.quiz?.type === 1
                                    ? quizList[quizIndex]?.answerQuiz?.map((item2: any, index) => {
                                        return <div key={index + 1} className="choose__answer__quiz" onClick={() => {
                                            if (check !== true) {
                                                setSelect({ id: item2._id, isCorrect: item2.isCorrect })
                                                setCheck(false)
                                            }
                                        }}>
                                            <div className={`py-[10px] border-2 ${item2._id == select?.id
                                                ? " bg-[#D6EAF8] text-[#5DADE2] border-[#5DADE2]"
                                                : "border-[#CCCCCC]"} 
                                                ${check === true
                                                    ? item2._id == select?.id
                                                        ? select?.isCorrect === 1
                                                            ? "bg-[#D6EAF8] border-[#5DADE2] "
                                                            : "bg-[#F9EBEA] !border-[#C0392B] !text-[#C0392B]"
                                                        : ""
                                                    : ""} text-center rounded-md shadow-xl relative cursor-pointer `
                                            }>

                                                <p className="my-auto text-xl font-bold">{item2.answer}</p>
                                                <div className="px-[10px] py-[2px] border-2 border-[#CCCCCC] text-center rounded-2xl absolute bottom-[5px] left-[15px]">
                                                    <span className="text-xl font-bold">{index + 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    })

                                    : quizList[quizIndex]?.quiz?.type === 2
                                        ? <div className="box__question__quiz__item">
                                            {quizList[quizIndex].answerQuiz.map((item, index) => {
                                                return <div key={index + 1}
                                                    className={`border-2 list__question__item ${item._id == select?.id
                                                        ? " border-[#5DADE2] bg-[#D6EAF8] text-[#2E86C1]"
                                                        : "border-[#CCCCCC]"} 
                                                    ${check === true
                                                            ? item._id == select?.id
                                                                ? select?.isCorrect === 1
                                                                    ? "bg-[#D6EAF8] border-[#5DADE2] "
                                                                    : "bg-[#F9EBEA] !border-[#C0392B] !text-[#C0392B]"
                                                                : ""
                                                            : ""} shadow-lg  mx-auto py-[20px] cursor-pointer rounded-xl `
                                                    }
                                                    onClick={() => {
                                                        if (check !== true) {
                                                            setSelect({ id: item._id, isCorrect: item.isCorrect })
                                                            setCheck(false)
                                                        }
                                                    }}
                                                >
                                                    <div className="img__result__question__item">
                                                        <img src={`../../../../assets/image/water.png`} />
                                                    </div>
                                                    <div className="title__result__question__item">
                                                        <span className="text-xl font-bold">{index + 1}. {item.answer}</span>
                                                    </div>
                                                </div>
                                            })}
                                        </div>

                                        : quizList[quizIndex]?.quiz?.type === 3
                                            ? <div className="box__item__chosse__question">
                                                <div className="btn__choose__result !justify-start mb-4">
                                                    {quizCompound?.map((item, index) => {
                                                        return <div key={index + 1}
                                                            className={`border-2 border-[#CCCCCC] item__btn__choose `}
                                                            onClick={() => {
                                                                setQuizCompound(quizCompound.filter((item2, index) => item2.id !== item.id))

                                                            }}
                                                        >
                                                            <button>
                                                                {item.answer}
                                                            </button>
                                                        </div>
                                                    })}
                                                </div>

                                                <div className="shelf__result__question__item">

                                                </div>
                                                <div className="btn__choose__result">
                                                    {quizList[quizIndex].answerQuiz.map((item, index) => {
                                                        const existAnswer = quizCompound.find(item2 => item2.id === item._id)
                                                        if (existAnswer) {
                                                            return <div key={index + 1}
                                                                className={`border-2 bg-[#CCCCCC] item__btn__choose `
                                                                }

                                                            >
                                                                <button className="bg-[#CCCCCC] text-[#CCCCCC]">
                                                                    {item.answer}
                                                                </button>
                                                            </div>
                                                        }
                                                        return <div key={index + 1}
                                                            className={`border-2 ${item._id == select?.id
                                                                ? " border-[#5DADE2] bg-[#D6EAF8] text-[#2E86C1]"
                                                                : "border-[#CCCCCC]"} 
                                                                ${check === true
                                                                    ? item._id == select?.id
                                                                        ? select?.isCorrect === 1
                                                                            ? "bg-[#D6EAF8] border-[#5DADE2] "
                                                                            : "bg-[#F9EBEA] !border-[#C0392B] !text-[#C0392B]"
                                                                        : ""
                                                                    : ""} item__btn__choose `
                                                            }
                                                            onClick={() => {
                                                                if (check !== true) {
                                                                    setCheck(false)
                                                                    setQuizCompound([...quizCompound, { id: item._id, isCorrect: item.isCorrect, answer: item.answer }])
                                                                }
                                                            }}
                                                        >
                                                            <button>
                                                                {item.answer}
                                                            </button>
                                                        </div>
                                                    })}
                                                </div>
                                            </div>
                                            : ""
                                : ""
                            }

                            <div className='flex flex-row gap-4'>
                                <div className='md:basis-3/4 '>

                                    {check === true && select?.isCorrect === 1 || check === true && check2 === true && select === null
                                        ? <section className='w-full mx-auto md:py-[30px]'>
                                            <div className="">
                                                <div className="bg-[#D6EAF8] border-[#5DADE2]  px-[15px] py-[10px] rounded-md">
                                                    <p className="text-[#2E86C1] font-bold ">Câu trả lời chính xác</p>
                                                    <button onClick={onContinute} className="text-white w-full py-[10px] rounded-md bg-[#5DADE2] mb-[20px] font-bold">
                                                        Tiếp tục
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                        : ""}



                                    {check === true && select?.isCorrect === 0 || check === true && check2 === false && select === null
                                        ? <section className='w-full mx-auto md:py-[30px]'>
                                            <div className="">
                                                <div className="bg-[#F9EBEA]  px-[15px] rounded-md">
                                                    <p className=" py-[10px] text-[#C0392B] font-bold">Đó chưa phải đáp án đúng</p>
                                                    <button onClick={onContinute} className="text-white w-full py-[10px] rounded-md bg-[#C0392B] mb-[20px] font-bold">
                                                        Tiếp tục
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                        : ""}

                                    {done === true
                                        ? <section className='w-full mx-auto md:py-[30px]'>
                                            <div className="">
                                                <div className="bg-[#D6EAF8] border-[#5DADE2] px-[15px]  rounded-md">
                                                    <p className=" py-[10px] text-[#2E86C1] font-bold">Chúc Mừng Bạn đã hoàn thành !</p>
                                                    <button onClick={onFinish} className="text-white w-full py-[10px] rounded-md bg-[#5DADE2] mb-[20px] font-bold">
                                                        Xem Kết Quả
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                        : ""}


                                </div>

                                <div className='mt-8 md:basis-1/4'>
                                    <button
                                        disabled={select === null  ? true : false}
                                        className={`${check === true
                                            ? select?.isCorrect === 1 || check2 === true
                                                ? "bg-[#D6EAF8] text-[#5DADE2] border-[#5DADE2] "
                                                : "bg-[#C0392B] text-white"
                                            : "hover:bg-gray-100 "}  
                                            border-2 border-[#CCCCCC] px-[30px] py-[5px] font-bold text-lg rounded-md float-right cursor-pointer transition duration-700`} onClick={() => {
                                            setCheck(true)
                                            increase()

                                            if (checkFlag === 1) {
                                                setSelect({ isCorrect: 1, type: 3 })
                                            }
                                            if (checkFlag === 0 && select === null) {
                                                setSelect({ isCorrect: 0, type: 3 })
                                                console.log("abc")
                                            }

                                            if (select !== null && select.type === undefined) {
                                                console.log("result 2");
                                                setResult([...result, {
                                                    quiz: quizList[quizIndex].quiz._id,
                                                    answerQuiz: select.id,
                                                    time: flag1,
                                                    point: select.isCorrect ? Math.round(flag2) : 0,
                                                    isCorrect: select.isCorrect
                                                }])
                                            } else {
                                                console.log("result 1");
                                                setResult([...result, {
                                                    quiz: quizList[quizIndex].quiz._id,
                                                    time: flag1,
                                                    point: checkFlag === 1 ? Math.round(flag2) : 0,
                                                    isCorrect: checkFlag,
                                                    answer: answerType3
                                                }])
                                            }
                                            console.log("result", result);

                                            speak({ text: `${select?.isCorrect === 1 ? "Correct": "Wrong"}`, voice: voices[2] })
                                            // select?.isCorrect === 1 ? audioCorrect.play() : audioWrong.play()
                                        }}>
                                        Kiểm tra
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Menu />

                    </div>

                    <Button type="primary" onClick={showModal}>
                        Open Modal
                    </Button>


                    <Modal title="Basic Modal" visible={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={'60%'}>
                        <Collapse defaultActiveKey={history?.length} onChange={onChange}>

                            {history?.map((item: any, index: number) => {
                                return <Panel
                                    key={index + 1}
                                    showArrow={false}
                                    header={
                                        <div key={index + 1} className="flex flex-row justify-between gap-4">
                                            <div className="">{moment(item.history.createdAt).format("H:mm:ss, Do/MM/YYYY")}</div>
                                            <div className="">{item.category?.title}</div>
                                            <div className="">{item.history?.totalCorrect}/{quizList.length}</div>
                                            <div className="">{item.history.result === 0 ? "Fail" : "Pass"}</div>
                                        </div>
                                    }
                                >
                                    <table className='table__list__result'>
                                        <thead>
                                            <tr>
                                                <th className='m-auto'>Câu trả lời chính xác</th>
                                                <th className='m-auto'>Câu trả lời của bạn</th>
                                                <th className='m-auto'>Thời gian</th>
                                                <th>Điểm</th>
                                                <th>Kết quả</th>
                                            </tr>
                                        </thead>
                                        <tbody className='body__table__result '>
                                            {item.userQuiz.map((item2: any, index: number) => {
                                                return <tr key={index + 1} className="">
                                                    <td className="">{item2.answerQuiz ? item2.correctAnswer.answer : item2.quiz?.question?.toLowerCase().replace("?", "").trim()}</td>
                                                    <td className="">{item2.answerQuiz ? item2.answerQuiz.answer : item2.answer}</td>
                                                    <td className="">{item2.time}</td>
                                                    <td className="">{Math.round(item2.point)}</td>
                                                    <td>
                                                        {item2.answerQuiz?.isCorrect === item2.correctAnswer?.isCorrect || item2.answer === item2.quiz?.question.toLowerCase().replace("?", "").trim()
                                                            ? <i className="fa-solid fa-thumbs-up result__correct__icon"></i>
                                                            : <i className="fa-solid fa-circle-xmark result__wrong__icon"></i>}
                                                    </td>
                                                </tr>
                                            })}

                                        </tbody>
                                        <tfoot className='border-t'>
                                            <tr className='result__medium'>
                                                <td>Kết quả:</td>
                                                <td> </td>
                                                <td>{item.history?.totalCorrect}/{quizList.length}</td>
                                                <td>{item.history.totalPoint}</td>
                                                <td>{item.history.result === 0 ? "Fail" : "Pass"}</td>

                                            </tr>

                                        </tfoot>
                                    </table>
                                </Panel>
                            })}

                        </Collapse>
                    </Modal>
                </div>

                <div className="col-span-3  advertisement__source__learning">
                    
                </div>
            </div>

        </>
    )
}

export default QuizPage