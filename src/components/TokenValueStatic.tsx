import React, { useMemo } from 'react'
import styled from '@emotion/styled'

import { AssetValue, AssetValueNumberStyle } from '../utils/number'
import LoadingIcon from './LoadingIcon'

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
`

const Symbol = styled.div`
  display: inline-block;
  margin-left: 0.3em;
  font-size: 70%;
  color: ${(p: any) => p.theme.tokenValueStatic.token.textColor};
`

interface Props {
  className?: string,
  token?: string,
  amount?: any,
  showSymbol?: boolean,
  prefix?: any,
}

const TokenValue: React.FunctionComponent<Props> = ({ className, token, amount, showSymbol, prefix }) => {
  const { num, frac, symbol } = useMemo(() => {
    let str
    let symbol

    if (token && undefined !== amount) {
      const ab = AssetValue.fromTokenAmount(token, amount)
      str = ab.toString({ numberStyle: AssetValueNumberStyle.SUCCINCT_SCALED })
      symbol = ab.getAsset().symbol
    }

    if (str) {
      const [num, frac] = str.split('.')

      return {
        num,
        frac: frac && frac !== '00' ? frac : null,
        symbol
      }
    } else {
      return {}
    }
  }, [token, amount])

  let content = <StyledLoadingIcon />

  if (num) {
    content = (
      <React.Fragment>
        <Num>{prefix}{num}</Num>
        {frac ? <Frac>.{frac}</Frac> : null}
        {showSymbol ? <Symbol>{symbol}</Symbol> : null}
      </React.Fragment>
    )
  }

  return (
    <Container className={className}>{content}</Container>
  )
}

export default TokenValue

