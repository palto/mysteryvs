import {useState} from "react";
import {format} from "date-fns";
import {useInterval} from "usehooks-ts";
import {Button} from "@/components/ui/button";

export function Timer() {
    const [startTime, setStartTime] = useState(Date.now());
    const [timerText, setTimerText] = useState("");

    useInterval(() => {
        const currentTime = Date.now();
        const difference = currentTime - startTime;

        setTimerText(format(difference, "mm:ss:SSS"));
    }, 100);

    return <>
        <Button onClick={() => setStartTime(Date.now())}>Aloita</Button>
        {timerText}
    </>

}