import { SATS_PER_BTC, type BitcoinUnit } from "#shared/common";
import type { PropType } from "vue";

const BTC_FORMAT_OPTIONS = {
  minimumFractionDigits: 8,
  maximumFractionDigits: 8,
};

export default defineComponent({
  props: {
    sats: {
      type: Number,
      required: true,
    },
    unit: {
      type: String as PropType<BitcoinUnit>,
      required: true,
    },
  },
  setup(props) {
    useScript("https://kit.fontawesome.com/090ca49637.js");
    return () => {
      switch (props.unit) {
        case "Bitcoin":
          return `₿${(props.sats / SATS_PER_BTC).toLocaleString(undefined, BTC_FORMAT_OPTIONS)}`;
        case "Satoshis":
          return (
            <span>
              {props.sats.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
              <i class="fak fa-regular" />
            </span>
          );
      }
    };
  },
});
