import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSatelliteDish, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'

import getValueGenerator, { GeneratorType, ValueGeneratorType } from "utils/getValueGenerator"
import "./transmitter.scss"

interface Props {
  clickTransmitterCallback: (value:string) => void,
  generator: GeneratorType,
  inRange: boolean,
  kioskMode: boolean,
  openSesame?: boolean,
  reset: boolean,
  seed: number,
}

interface State {
  nextValue: string,
  showValue: boolean,
  value: string,
}

export default class Transmitter extends React.Component<Props,State> {
  interval?:number
  pressStartTime: number
  timeout: number
  valueGenerator: ValueGeneratorType

  constructor(props:Props) {
    super(props)

    this.pressStartTime = -1
    this.timeout = -1
    this.valueGenerator = getValueGenerator(props.generator, props.seed)

    this.state = {
      nextValue: this.valueGenerator(),
      showValue: false,
      value: "",
    }
  }

  componentDidMount() {
    if(this.props.kioskMode === true) {
      this.interval = window.setInterval(
        () => {
          this.onPress()
          this.onLift()
        },
        3000,
      )
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps:Props) {
    if(
      prevProps.generator !== this.props.generator
      || prevProps.reset !== this.props.reset
    ) {
      this.valueGenerator = getValueGenerator(this.props.generator, this.props.seed) //set the generator

      this.setState({
        nextValue: this.valueGenerator(), //calculate the next value
        showValue: false,
        value: "",
      })
    }
  }

  onPress = () => {
    this.pressStartTime = new Date().getTime()
    clearTimeout(this.timeout)

    if(this.props.inRange) { //if the listener is in range
      this.props.clickTransmitterCallback(this.state.nextValue) //send the next value to the parent
    }

    this.setState({
      nextValue: this.valueGenerator(), //calculate the next value
      showValue: true,
      value: this.state.nextValue,
    })
  }

  onLift = () => {
    // const pressTime = new Date().getTime() - this.pressStartTime
    //
    // this.timeout = window.setTimeout(
    //   () => this.setState({ showValue: false }),
    //   1000 - pressTime,
    // )
  }


  render() {
    const {
      generator,
      openSesame,
    } = this.props

    const {
      nextValue,
      showValue,
      value,
    } = this.state

    return (
      <div className="transmitter">
        <div className={`value ${generator}` + (showValue?" show":"")}>
          <span>{value ||  "-"}</span>
          <FontAwesomeIcon icon={faSatelliteDish}/>
        </div>

        <div className={"nextValue" + (showValue?"":" show")} style={{opacity: openSesame?0:1}}>
          <b>Next Value: </b>{nextValue}
        </div>

        <br/>

        <div className="keyContainer">
          <div className="key">
            <span className="led"></span>
            <button onMouseDown={e => this.onPress()} onMouseUp={e => this.onLift()} onMouseLeave={e => this.onLift()}>
              <FontAwesomeIcon icon={faLockOpen}/> / <FontAwesomeIcon icon={faLock}/>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
