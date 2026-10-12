#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;

    // upper half: rows 1 to n
    for (int row=1;row<=n;row++){
        //sp1
        for (int sp = 1 ; sp <= 2*(n-row) ; sp++) cout<<" ";
        //st1
        for(int st1 = 1 ; st1 <= row ; st1++) cout<<"*";
        //sp2
        for (int sp2 = 1 ; sp2 <= 2*row-3 ; sp2++) cout<<" ";
        //st2
        if(row!=1){
            for (int st2 = 1 ; st2 <= row ; st2++) cout<<"*";
        }
        cout<<endl;
    }

    // lower half (inverted): rows n-1 down to 1
    for (int row=n-1;row>=1;row--){
        for (int sp = 1 ; sp <= 2*(n-row) ; sp++) cout<<" ";
        for(int st1 = 1 ; st1 <= row ; st1++) cout<<"*";
        for (int sp2 = 1 ; sp2 <= 2*row-3 ; sp2++) cout<<" ";
        if(row!=1){
            for (int st2 = 1 ; st2 <= row ; st2++) cout<<"*";
        }
        cout<<endl;
    }
    return 0;
}