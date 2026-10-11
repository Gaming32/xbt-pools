import { COIN, type BitcoinUnit } from "#shared/common";
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
    const { n } = useI18n();
    return () => {
      switch (props.unit) {
        case "btc":
          return `₿${n(props.sats / COIN, BTC_FORMAT_OPTIONS)}`;
        case "sat":
          return (
            <span>
              {n(props.sats, { maximumFractionDigits: 0 })}
              <i class="fak fa-regular" />
            </span>
          );
      }
    };
  },
});
