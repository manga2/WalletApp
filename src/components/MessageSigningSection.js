import PropTypes from 'prop-types';
import React from 'react';
import lang from 'i18n-js';
import styled from 'styled-components';
import { BlockButton } from '../components/buttons';
import { Column } from '../components/layout';
import {
  Smallcaps,
  Text,
} from '../components/text';
import { withSafeAreaViewInsetValues } from '../hoc';
import { borders, colors, fonts, padding, position } from '../styles';

const Message = styled(Text).attrs({ size: 'lmedium' })`
  color: ${colors.alpha(colors.blueGreyDark, 0.6)}
  margin-top: 5;
`;

const MessageRow = styled(Column)`
  ${padding(19, 19, 18)}
  flex-shrink: 0;
`;

const BottomSheet = styled(Column).attrs({ justify: 'space-between' })`
  ${borders.buildRadius('top', 15)}
  background-color: ${colors.white};
  flex: 0;
  min-height: ${({ bottomInset }) => (bottomInset + 236)};
  padding-bottom: ${({ bottomInset }) => bottomInset};
  width: 100%;
`;

const SendButtonContainer = styled.View`
  ${padding(7, 15, 14)}
  flex-shrink: 0;
`;

const MessageSigningSection = ({
  message,
  onSignMessage,
  safeAreaInset,
}) => (
  <BottomSheet bottomInset={safeAreaInset.bottom}>
    <MessageRow>
      <Smallcaps>{lang.t('wallet.message_signing.message')}</Smallcaps>
      <Message>{message}</Message>
    </MessageRow>
    <SendButtonContainer>
      <BlockButton onPress={onSignMessage}>
        {lang.t('wallet.message_signing.sign')}
      </BlockButton>
    </SendButtonContainer>
  </BottomSheet>
);

MessageSigningSection.propTypes = {
  message: PropTypes.string,
  onSignMessage: PropTypes.func,
  safeAreaInset: PropTypes.object,
};

export default withSafeAreaViewInsetValues(MessageSigningSection);
