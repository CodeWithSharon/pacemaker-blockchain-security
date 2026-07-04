"""
Configuration Checker
====================
Checks if the system is properly configured for blockchain mode.
"""

import os
import sys
from web3 import Web3
from dotenv import load_dotenv

def print_status(check_name, passed, message=""):
    """Print check status"""
    if passed:
        print(f"✅ {check_name}: PASS {message}")
    else:
        print(f"❌ {check_name}: FAIL {message}")
    return passed

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    passed = version.major == 3 and version.minor >= 7
    return print_status(
        "Python Version",
        passed,
        f"(v{version.major}.{version.minor}.{version.micro})"
    )

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import web3
        import dotenv
        print_status("Required Packages", True, "(web3, python-dotenv installed)")
        return True
    except ImportError as e:
        print_status("Required Packages", False, f"(Missing: {str(e)})")
        print("   Run: pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists"""
    env_path = os.path.join(os.path.dirname(__file__), '..', 'access-control', '.env')
    exists = os.path.exists(env_path)
    print_status(".env File", exists, f"({env_path})")
    
    if exists:
        load_dotenv(env_path)
        
        # Check required variables
        required_vars = ['RPC_URL', 'ADMIN_ADDRESS', 'ADMIN_PRIVATE_KEY', 
                        'DEVICE_DOCTOR_ADDRESS', 'DEVICE_DOCTOR_KEY']
        
        all_present = True
        for var in required_vars:
            value = os.getenv(var)
            if not value:
                print(f"   ⚠️  Missing variable: {var}")
                all_present = False
        
        if all_present:
            print("   ✅ All required variables present")
        
        return all_present
    return False

def check_blockchain_connection():
    """Check connection to Hardhat node"""
    try:
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'access-control', '.env'))
        rpc_url = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
        
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        connected = w3.is_connected()
        
        if connected:
            block_number = w3.eth.block_number
            chain_id = w3.eth.chain_id
            print_status(
                "Blockchain Connection",
                True,
                f"(Block: {block_number}, Chain ID: {chain_id})"
            )
        else:
            print_status("Blockchain Connection", False, f"({rpc_url})")
            print("   ⚠️  Start Hardhat node: npx hardhat node")
        
        return connected
    except Exception as e:
        print_status("Blockchain Connection", False, f"({str(e)})")
        return False

def check_contract_addresses():
    """Check if contract address files exist"""
    contracts_dir = os.path.join(os.path.dirname(__file__), '..', 'access-control')
    
    files = {
        'CommandValidator': 'contract-address.txt',
        'AccessControl': 'deployedAddress.txt'
    }
    
    all_exist = True
    for name, filename in files.items():
        path = os.path.join(contracts_dir, filename)
        exists = os.path.exists(path)
        
        if exists:
            with open(path, 'r') as f:
                address = f.read().strip()
                print_status(f"{name} Address", True, f"({address[:20]}...)")
        else:
            print_status(f"{name} Address", False, f"({filename} not found)")
            all_exist = False
    
    if not all_exist:
        print("   ⚠️  Deploy contracts: npx hardhat run scripts/deploy.js --network localhost")
    
    return all_exist

def check_contract_artifacts():
    """Check if contract ABI files exist"""
    artifacts_dir = os.path.join(
        os.path.dirname(__file__), '..', 'access-control', 
        'artifacts', 'contracts'
    )
    
    contracts = [
        ('CommandValidator.sol', 'CommandValidator.json'),
        ('UnauthorizedAccessControl.sol', 'UnauthorizedAccessControl.json')
    ]
    
    all_exist = True
    for folder, filename in contracts:
        path = os.path.join(artifacts_dir, folder, filename)
        exists = os.path.exists(path)
        
        if exists:
            print_status(f"ABI: {filename}", True)
        else:
            print_status(f"ABI: {filename}", False, f"(Not found)")
            all_exist = False
    
    if not all_exist:
        print("   ⚠️  Compile contracts: npx hardhat compile")
    
    return all_exist

def check_account_balances():
    """Check if accounts have sufficient ETH"""
    try:
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'access-control', '.env'))
        rpc_url = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
        
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            return False
        
        accounts = {
            'Admin': os.getenv('ADMIN_ADDRESS'),
            'Doctor': os.getenv('DEVICE_DOCTOR_ADDRESS'),
            'Technician': os.getenv('DEVICE_TECH_ADDRESS'),
            'Emergency': os.getenv('DEVICE_EMERGENCY_ADDRESS')
        }
        
        all_funded = True
        for name, address in accounts.items():
            if address:
                balance = w3.eth.get_balance(w3.to_checksum_address(address))
                balance_eth = w3.from_wei(balance, 'ether')
                
                has_funds = balance > 0
                print_status(
                    f"{name} Account Balance",
                    has_funds,
                    f"({balance_eth:.4f} ETH)"
                )
                
                if not has_funds:
                    all_funded = False
        
        if not all_funded:
            print("   ⚠️  Accounts need ETH. Restart Hardhat node to reset balances.")
        
        return all_funded
    except Exception as e:
        print_status("Account Balances", False, f"({str(e)})")
        return False

def main():
    """Run all configuration checks"""
    print("=" * 80)
    print("PACEMAKER BLOCKCHAIN DEMO - CONFIGURATION CHECKER")
    print("=" * 80)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", check_env_file),
        ("Blockchain Connection", check_blockchain_connection),
        ("Contract Addresses", check_contract_addresses),
        ("Contract Artifacts", check_contract_artifacts),
        ("Account Balances", check_account_balances)
    ]
    
    results = []
    for name, check_func in checks:
        result = check_func()
        results.append(result)
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nPassed: {passed}/{total} checks")
    
    if passed == total:
        print("\n✅ ALL CHECKS PASSED!")
        print("   You can run the demo in BLOCKCHAIN MODE")
        print("   Run: python main.py")
    elif passed >= 2:  # At least Python and dependencies
        print("\n⚠️  SOME CHECKS FAILED")
        print("   You can still run the demo in SIMULATION MODE")
        print("   For BLOCKCHAIN MODE, fix the issues above")
    else:
        print("\n❌ CRITICAL CHECKS FAILED")
        print("   Install dependencies first: pip install -r requirements.txt")
    
    print()

if __name__ == "__main__":
    main()
