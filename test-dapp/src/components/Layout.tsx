import React from 'react'
import styled from '@emotion/styled'

const Container = styled.div`
  background-color: ${(p: any) => p.theme.layout.bgColor};
  color: ${(p: any) => p.theme.layout.textColor};
  width: 100vw;
  min-height: 100vh;
  padding: 2rem;
`

const Layout: React.FunctionComponent = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  )
}

export default Layout

