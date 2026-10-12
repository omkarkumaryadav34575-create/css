#include <iostream>
using namespace std;
int main(){
    int t;cin>>t;
    for (int i= 1;i<=t;i++){
        int n;cin>>n;
    bool rowFlag =true;
    for (int row =1;row<=2*n;row++){
        if(row%2) rowFlag=!rowFlag;

        bool flag= rowFlag?false:true;
        for(int col=1;col<=2*n;col++){
            if (col%2) flag = !flag;
            if(!flag) cout<<"#";
            else cout<<".";



        }cout<<endl;
        

    }

    
    }
    return 0;
}