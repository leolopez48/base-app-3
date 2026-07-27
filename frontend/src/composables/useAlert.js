import { storeToRefs } from "pinia";
import { useAlertStore } from "../stores/alert";
import { watch } from "vue";

const useAlert = () => {
    const alertStore = useAlertStore();

    const { message, time, type, show } = storeToRefs(alertStore);
    const alert = new Alert(message, time, type, show);

    const scheduleHide = (delay) => {
        setTimeout(() => {
            show.value = false;
        }, delay);
    };

    watch(show, (newValue) => {
        if (newValue && time.value !== -1) {
            scheduleHide(time.value);
        }
    });

    watch(time, (newValue) => {
        if (newValue !== -1 && show.value) {
            scheduleHide(newValue);
        }
    });

    return { message, time, type, show, alert };
};

class Alert {
    constructor(message, time, type, show) {
        this.message = message;
        this.time = time;
        this.type = type;
        this.show = show;
    }

    _show(msg, type, tim = 5000) {
        this.message.value = msg;
        this.type.value = type;
        this.time.value = tim;
        this.show.value = true;
    }

    success(msg, tim = 5000) { this._show(msg, "alert-success", tim); }
    error(msg, tim = 5000)   { this._show(msg, "alert-error", tim); }
    warning(msg, tim = 5000) { this._show(msg, "alert-warning", tim); }
    info(msg, tim = 5000)    { this._show(msg, "alert-info", tim); }

    hide() {
        this.show.value = false;
        this.time.value = 5000;
    }
}

export default useAlert;
