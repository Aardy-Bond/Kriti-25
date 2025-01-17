// import metamask from '../assets/metamask.png'

const Wallet=({onConnect})=>{
    return(
        <>
        <div style={{display:'flex',justifyContent:'center',flexDirection:'column' , alignItems:'center'}}>
        <button className='connect-btn' onClick={onConnect}>Connect to Metamask</button>
        </div>
        </>
    )
}

export default Wallet