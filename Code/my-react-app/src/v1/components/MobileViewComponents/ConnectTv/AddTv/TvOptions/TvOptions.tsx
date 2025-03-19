import styles from "./TvOptions.module.css";
import SalahIcon from "../../../../../photos/Newuiphotos/menuIcons/salah.webp";
import EventIcon from "../../../../../photos/Newuiphotos/menuIcons/event.webp";
import BackButton from "../../../Shared/BackButton";
import { useNavigationprop } from "../../../../../../MyProvider";
import { customNavigatorTo } from "../../../../../helpers/HelperFunction";

function TvOptions() {
  const navigation = useNavigationprop();

  return (
    <div className={styles.tvOptions}>
      <div className={"title-container"}>
        <div className="goback">
          <BackButton
            handleBackBtn={navigation ? navigation : customNavigatorTo}
            isHome={true}
          />
        </div>
        <h3 className="page-title">Select Option</h3>
      </div>
      <div className={styles.tvViewSelection}>
        <span className={styles.deviceName}>
          <em>Connected With</em>
          <b>"Test"</b>
        </span>
        <p className={styles.selectOption}>Select Option to Display on TV</p>
        <div className={styles.salahView}>
          <div className={styles.viewName} onClick={() => {}}>
            <div className={styles.viewContent}>
              <img src={SalahIcon} alt="Salah Timings" />
              <b>Salah Timings</b>
            </div>
          </div>
          <div className={styles.viewName} onClick={() => {}}>
            <div className={styles.viewContent}>
              <img src={EventIcon} alt="Events" />
              <b>Events</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TvOptions;
