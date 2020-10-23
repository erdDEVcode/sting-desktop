import React, { useMemo } from 'react'
import styled from '@emotion/styled'

import { AssetValue, AssetValueNumberStyle } from '../utils/number'
import LoadingIcon from './LoadingIcon'

import Odometer from './Odometer'

const Container = styled.div`
  display: inline-block;
  ${(p: any) => p.theme.font('body')};
`

const StyledLoadingIcon = styled(LoadingIcon)`
`

const Num = styled.div`
  display: inline-block;
`

const Frac = styled.div`
  display: inline-block;

  &:before {
    content: '.';
    margin: 0 0.1em;
  }
`

interface Props {
  className?: string,
  token?: string,
  amount?: any,
}

const TokenValue: React.FunctionComponent<Props> = ({ className, token, amount }) => {
  const { num, frac } = useMemo(() => {
    let str

    if (token && undefined !== amount) {
      const ab = AssetValue.fromTokenAmount(token, amount)
      str = ab.toString({ numberStyle: AssetValueNumberStyle.SUCCINCT_SCALED })
    }

    if (str) {
      const [num, frac] = str.split('.')

      return {
        num,
        frac: (typeof frac !== 'undefined') ? `1${frac}${frac.length === 1 ? '0' : ''}` : undefined
      }
    } else {
      return {}
    }
  }, [token, amount])

  let content = <StyledLoadingIcon />

  if (num) {
    content = (
      <React.Fragment>
        <Num>
          <Odometer value={num} />
        </Num>
        {frac ? (
          <Frac><Odometer value={frac} decimals={true} /></Frac>
        ) : null}
      </React.Fragment>
    )
  }

  return (
    <Container className={className}>{content}</Container>
  )
}

export default TokenValue

