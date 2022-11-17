import React, { useContext, useEffect, useRef, useState } from 'react'
// import io from 'socket.io'
import io from 'socket.io-client'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { changeSpeechFinish, changeSpeechValue } from '../../features/Slide/googleSpeech/GoogleSpeechSlice';
import Countdown from 'react-countdown';
// import {} from './recorderWorkletProcessor'

type GoogleSpeechExamProps = {
    resetSpeaker: boolean,
    onHanldeResetSpeaker: (value: boolean) => void
}

const socket = io("http://localhost:8000", { transports: ['websocket'] });

const CountdownWrapper = ({ time, reset }) => {
    //---TimeLimitCountdown---
    //Đếm ngược thời gian làm 
    const [state, setState] = useState<any>()
    const renderer = ({ hours, minutes, seconds, completed }) => {
        return <span>{seconds}</span>;
    };

    useEffect(() => {
        setState(Date.now() + time)
    }, [time, reset])

    return <Countdown
        // date={Date.now() + 7000}
        date={state}
        renderer={renderer}
    />
};

const MemoCountdown = React.memo(CountdownWrapper);



const GoogleSpeechExam = ({ resetSpeaker, onHanldeResetSpeaker }: GoogleSpeechExamProps) => {
    const transcript = useAppSelector(item => item.googleSpeech.transcript)
    const isFinish = useAppSelector(item => item.googleSpeech.isFinish)
    const arrReset = useAppSelector(item => item.googleSpeech.arrReset)
    const dispatch = useAppDispatch()

    const renderer = ({ hours, minutes, seconds, completed }) => {
        return <span>{seconds}</span>;
    };

    useEffect(() => {
        //================= CONFIG =================
        // Stream Audio
        let bufferSize = 2048,
            AudioContext,
            context,
            processor,
            input,
            globalStream;

        //vars
        let audioElement = document.querySelector('audio') as HTMLAudioElement,
            finalWord = false,
            resultText: any = document.getElementById('ResultText') as HTMLParagraphElement,
            removeLastSentence = true,
            streamStreaming = false;

        //audioStream constraints
        const constraints = {
            audio: true,
            video: false,
        };

        //================= RECORDING =================

        async function initRecording() {
            socket.emit('startGoogleCloudStream', ''); //init socket Google Speech Connection
            streamStreaming = true;
            AudioContext = window.AudioContext
            context = new AudioContext({
                // if Non-interactive, use 'playback' or 'balanced' // https://developer.mozilla.org/en-US/docs/Web/API/AudioContextLatencyCategory
                latencyHint: 'interactive',
            });

            await context.audioWorklet.addModule('/assets/js2/recorderWorkletProcessor3.js')
            context.resume();

            globalStream = await navigator.mediaDevices.getUserMedia(constraints)
            input = context.createMediaStreamSource(globalStream)
            processor = new window.AudioWorkletNode(
                context,
                'recorder.worklet'
            );
            processor.connect(context.destination);
            context.resume()
            input.connect(processor)
            processor.port.onmessage = (e) => {
                const audioData = e.data;
                microphoneProcess(audioData)
            }
        }

        function microphoneProcess(buffer) {
            socket.emit('binaryData', buffer);
        }

        //================= INTERFACE =================
        var startButton = document.getElementById('startRecButton') as HTMLButtonElement;
        startButton.addEventListener('click', startRecording);
        var endButton = document.getElementById('stopRecButton') as HTMLButtonElement;
        var recordingStatus = document.getElementById('recordingStatus') as HTMLDivElement;

        if (resetSpeaker) {
            startRecording()
        }

        function startRecording() {
            startButton.disabled = true;
            startButton.className = "text-white !h-10 !w-10 !bg-red-600 !rounded-full scale-105 "
            initRecording();
            console.log("start")
            setTimeout(() => {
                stopRecording()
                console.log("end")
            }, 7000)

        }

        function stopRecording() {
            // waited for FinalWord
            startButton.disabled = false;
            startButton.className = "text-white !h-10 !w-10 !bg-blue-600 !rounded-full "
            streamStreaming = false;
            socket.emit('endGoogleCloudStream', '');

            let track = globalStream.getTracks()[0];
            track.stop();

            input.disconnect(processor);
            processor.disconnect(context.destination);
            context.close().then(function () {
                input = null;
                processor = null;
                context = null;
                AudioContext = null;
                startButton.disabled = false;
                dispatch(changeSpeechFinish(true))
                onHanldeResetSpeaker(false)
            });

        }

        //================= SOCKET IO =================
        socket.on('connect', () => {
            // console.log('connected to socket');
            socket.emit('join', 'Server Connected to Client');
        });

        socket.on('messages', function (data) {
            // console.log(data);
        });

        socket.on('speechData', function (data) {
            var dataFinal = undefined || data.results[0].isFinal;
            if (dataFinal === false) {
                removeLastSentence = true;
            } else if (dataFinal === true) {
                dispatch(changeSpeechValue(data))
                finalWord = true;
                removeLastSentence = false;
            }
        });

        window.onbeforeunload = function () {
            if (streamStreaming) {
                socket.emit('endGoogleCloudStream', '');
            }
        };

        //================= SANTAS HELPERS =================

        // sampleRateHertz 16000 //saved sound is awefull
        function convertFloat32ToInt16(buffer) {
            let l = buffer.length;
            let buf = new Int16Array(l / 3);

            while (l--) {
                if (l % 3 == 0) {
                    buf[l / 3] = buffer[l] * 0xffff;
                }
            }
            return buf.buffer;
        }

        function capitalize(s) {
            if (s.length < 1) {
                return s;
            }
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
    }, [arrReset, isFinish])

    return (
        <div>
            <audio></audio>
            <button className=' !h-10 !w-10 !bg-blue-600 !rounded-full !text-white ' id="startRecButton" type="button" >
                {/* <i className="fa-solid fa-volume-high !m-0 !p-0"></i> */}
                <Countdown
                    date={Date.now() + 7000}
                    renderer={renderer}
                />
                {/* <MemoCountdown time={7000} reset={isFinish} /> */}
            </button>
        </div>
    )
}

export default GoogleSpeechExam