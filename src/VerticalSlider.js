/**
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  value: number,
  disabled: boolean,
  min: number,
  max: number,
  onChange: (value: number) => void,
  onComplete: (value: number) => void,
  width: number,
  height: number,
  borderRadius: number,
  maximumTrackTintColor: string,
  minimumTrackTintColor: Array<string>,
  showBallIndicator: boolean,
  step?: number,
  ballIndicatorColor?: string,
  ballIndicatorWidth?: number,
  ballIndicatorPosition?: number,
  ballIndicatorTextColor?: string,
  animationDuration?: number,
};

type State = {
  value: number,
  sliderHeight: any,
  ballHeight: any,
  panResponder: any,
};

export default class VerticalSlider extends Component<Props, State> {
  _moveStartValue = null;

  constructor(props: Props) {
    super(props);

    let panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {
        this._moveStartValue = this.state.value;
        this.setState({showText: true});
      },
      onPanResponderMove: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onChange) {
          this.props.onChange(value);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
          this.setState({showText: false});
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: (event, gestureState) => {
        if (this.props.disabled) {
          return;
        }
        const value = this._fetchNewValueFromGesture(gestureState);
        this._changeState(value);
        if (this.props.onComplete) {
          this.props.onComplete(value);
        }
      },
    });

    this.state = {
      value: props.value,
      sliderHeight: new Animated.Value(0),
      ballHeight: new Animated.Value(0),
      panResponder,
      showText: false,
    };
  }

  _fetchNewValueFromGesture(gestureState: any): number {
    const {min, max, step, height} = this.props;
    const ratio = -gestureState.dy / height;
    const diff = max - min;
    if (step) {
      return Math.max(
        min,
        Math.min(
          max,
          this._moveStartValue + Math.round((ratio * diff) / step) * step,
        ),
      );
    }
    let value = Math.max(min, this._moveStartValue + ratio * diff);
    return Math.floor(value * 100) / 100;
  }

  _getSliderHeight(value: number): number {
    const {min, max, height} = this.props;
    return ((value - min) * height) / (max - min);
  }

  _changeState(value: number): void {
    const {height, ballIndicatorWidth, animationDuration} = this.props;
    const sliderHeight = this._getSliderHeight(value);
    let ballPosition = sliderHeight;
    const ballHeight = (ballIndicatorWidth ? ballIndicatorWidth : 48) / 2;
    if (ballPosition + ballHeight > height) {
      ballPosition = height - ballHeight * 1;
    } else if (ballPosition - ballHeight <= 0) {
      ballPosition = 0;
    } else {
      ballPosition = ballPosition - ballHeight;
    }
    Animated.parallel([
      Animated.timing(this.state.sliderHeight, {
        toValue: sliderHeight,
        easing: Easing.linear,
        duration: animationDuration || 50,
      }),
      Animated.timing(this.state.ballHeight, {
        toValue: ballPosition,
        easing: Easing.linear,
        duration: animationDuration || 50,
      }),
    ]).start();
    this.setState({value});
  }

  _fetchBallIndicatorColor(): string {
    const {value} = this.state;
    const {max, min, ballIndicatorColor} = this.props;
    if (ballIndicatorColor) {
      return ballIndicatorColor;
    }
    const minimumTrackTintColor = this.props.minimumTrackTintColor
      ? this.props.minimumTrackTintColor
      : ['#000000'];
    const colorLength = minimumTrackTintColor.length - 1;
    const percentage = (value / (max - min)) * 100;
    const divideValue = 100 / colorLength;
    let colorIndex = Math.floor(percentage / divideValue);
    // START FOR
    // for (let iterateColor = 0; iterateColor < colorLength; iterateColor++) {
    //   let startValue = iterateColor * divideValue;
    //   let endValue = startValue + divideValue;
    //   if (percentage > startValue && percentage < endValue) {
    //     colorIndex = iterateColor;
    //   }
    // }
    // END FOR
    if (minimumTrackTintColor[colorIndex]) {
      return minimumTrackTintColor[colorIndex];
    }
    return '#000000';
  }

  componentDidMount(): void {
    const {value} = this.props;
    if (value) {
      this._changeState(value);
    }
  }

  render() {
    const {
      value,
      disabled,
      onButtonPress,
      min,
      max,
      onChange,
      onComplete,
      width,
      height,
      borderRadius,
      maximumTrackTintColor,
      minimumTrackTintColor,
      showBallIndicator,
      ballIndicatorColor,
      ballIndicatorWidth,
      ballIndicatorPosition,
      ballIndicatorTextColor,
    } = this.props;
    return (
      <View style={[{height, width, borderRadius}]}>
        <View
          style={[
            styles.container,
            styles.shadow,
            {
              height,
              width,
              borderRadius,
              backgroundColor: maximumTrackTintColor
                ? maximumTrackTintColor
                : '#ECECEC',
            },
          ]}>
          <Animated.View
            style={[
              styles.slider,
              {
                height: this.state.sliderHeight,
                width,
              },
            ]}>
            <LinearGradient
              colors={
                minimumTrackTintColor ? minimumTrackTintColor : ['#000000']
              }
              start={{x: 1.0, y: 1.0}}
              end={{x: 0.0, y: 0.0}}
              style={styles.linearGradient}
            />
          </Animated.View>
        </View>
        {this.props.showBallIndicator ? (
          <Animated.View
            {...this.state.panResponder.panHandlers}
            style={[
              styles.ball,
              styles.shadow,
              {
                width: ballIndicatorWidth ? ballIndicatorWidth : 48,
                height: ballIndicatorWidth ? ballIndicatorWidth : 48,
                borderRadius: ballIndicatorWidth ? ballIndicatorWidth / 2 : 24,
                bottom: this.state.ballHeight,
                left: ballIndicatorPosition ? ballIndicatorPosition : -60,
                backgroundColor: this._fetchBallIndicatorColor(),
              },
            ]}>
            <TouchableOpacity
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              disabled={!disabled}
              onPressIn={onButtonPress || null}>
              <Text
                style={[
                  styles.ballText,
                  {
                    color: ballIndicatorTextColor
                      ? ballIndicatorTextColor
                      : '#000000',
                  },
                ]}>
                {this.state.value}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        {this.state.showText ? (
          <Text style={{textAlign: 'center', width: 30}}>
            {this.state.value}%
          </Text>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  ball: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballText: {
    fontWeight: '900',
    fontSize: 13,
  },
  container: {
    // overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    bottom: 0,
  },
  linearGradient: {
    width: '100%',
    height: '100%',
  },
});
