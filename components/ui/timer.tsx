import {useState} from "react";
import {format} from "date-fns";
import {useInterval} from "usehooks-ts";
import {Button} from "@/components/ui/button";

export function Timer() {
    const [startTime, setStartTime] = useState<number|undefined>(undefined);
    const [timerText, setTimerText] = useState("");

    useInterval(() => {
        const running = !!startTime;
        if(!running) {
            return;
        }

        const currentTime = Date.now();
        const difference = currentTime - startTime;

        setTimerText(format(difference, "mm:ss:SSS"));
    }, 10);

    return <>
        <Button onClick={() => setStartTime(Date.now())}>Aloita</Button>
        {timerText}
    </>

}