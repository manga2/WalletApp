import { withSafeTimeout } from '@hocs/safe-timers';
import { isFunction } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Dimensions, InteractionManager, StyleSheet } from 'react-native';
import Permissions from 'react-native-permissions';
import ReactNativeQRCodeScanner from 'react-native-qrcode-scanner';
import styled from 'styled-components/primitives';
import CrosshairAsset from '../../assets/qrcode-scanner-crosshair.png';
import { colors, position } from '../../styles';
import { Centered } from '../layout';
import { ErrorText } from '../text';
import QRCodeScannerNeedsAuthorization from './QRCodeScannerNeedsAuthorization';

const CAMERA_PERMISSION = 'camera';
const PERMISSION_AUTHORIZED = 'authorized';

const styles = StyleSheet.create({
  disableSection: {
    flex: 0,
    height: 0,
  },
  fullscreen: {
    ...position.coverAsObject,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
});

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover}
  background-color: ${colors.black};
`;

const Crosshair = styled.Image`
  ${position.size(Dimensions.get('window').width * (293 / 375))}
  margin-bottom: 1;
  resize-mode: contain;
`;

const CrosshairContainer = styled(Centered)`
  ${position.cover}
`;

class QRCodeScanner extends PureComponent {
  static propTypes = {
    enableScanning: PropTypes.bool,
    onCameraReady: PropTypes.func,
    onSuccess: PropTypes.func,
    scannerRef: PropTypes.func,
    setSafeTimeout: PropTypes.func,
  }

  state = {
    error: null,
    isAuthorized: false,
    isInitialized: false,
  }

  componentDidMount = () => {
    this.handleIsAuthorized();
    this.props.setSafeTimeout(this.handleInitializationError, 5000);
  }

  componentDidUpdate = () => {
    const { enableScanning } = this.props;

    if (!this.scannerRef) return;

    InteractionManager.runAfterInteractions(() => {
      const isScannerEnabled = !this.scannerRef.state.disablingByUser;

      if (enableScanning && !isScannerEnabled) {
        this.handleEnableScanner();
      } else if (!enableScanning && isScannerEnabled) {
        this.handleDisableScanner();
      }
    });
  }

  handleDisableScanner = () => {
    if (isFunction(this.scannerRef.disable)) {
      console.log('📠🚫 Disabling QR Code Scanner');
      this.scannerRef.disable();
    }
  }

  handleEnableScanner = () => {
    if (isFunction(this.scannerRef.enable)) {
      console.log('📠✅ Enabling QR Code Scanner');
      this.scannerRef.enable();
    }
  }

  handleCameraReady = () => {
    console.log('📷 ✅ CAMERA READY');
    this.handleDidInitialize();
    if (this.props.onCameraReady) this.props.onCameraReady();
  }

  handleDidInitialize = () => this.setState({ isInitialized: true })

  handleError = error => this.setState({ error })

  handleIsAuthorized = () =>
    Permissions.request(CAMERA_PERMISSION)
      .then(response => this.setState({ isAuthorized: response === PERMISSION_AUTHORIZED }))

  handleInitializationError = () => {
    if (!this.state.isInitialized) {
      this.handleError('initializing');
    }
  }

  handleScannerRef = (ref) => { this.scannerRef = ref; }

  handleMountError = () => {
    console.log('📷 🚨 CAMERA MOUNT ERROR');
    this.handleError('mounting');
  }

  render = () => {
    const { onSuccess } = this.props;
    const { error, isAuthorized, isInitialized } = this.state;

    const showCrosshair = !error && isAuthorized && isInitialized;
    const showErrorMessage = error && isAuthorized && !isInitialized;

    return (
      <Container>
        <ReactNativeQRCodeScanner
          bottomViewStyle={styles.disableSection}
          cameraProps={{
            onCameraReady: this.handleCameraReady,
            onMountError: this.handleMountError,
          }}
          cameraStyle={styles.fullscreen}
          containerStyle={styles.fullscreen}
          notAuthorizedView={<QRCodeScannerNeedsAuthorization />}
          onRead={onSuccess}
          pendingAuthorizationView={<QRCodeScannerNeedsAuthorization />}
          reactivate={true}
          reactivateTimeout={1000}
          ref={this.handleScannerRef}
          topViewStyle={styles.disableSection}
        />
        {showErrorMessage && (
          <ErrorText
            color={colors.red}
            error={`Error ${error} camera`}
          />
        )}
        {showCrosshair && (
          <CrosshairContainer>
            <Crosshair source={CrosshairAsset} />
          </CrosshairContainer>
        )}
      </Container>
    );
  }
}

export default withSafeTimeout(QRCodeScanner);
